// =========================================================
// Diagnosis Controller
// =========================================================
// Handles crop/animal image upload + AI disease diagnosis + risk calculation.
// Connects:
//   - Real ML ONNX inference with MobileNetV2 (mlInferenceService.js)
//   - Pluggable fallback disease detection (diseaseDetectionService.js)
//   - Agronomic/Livestock risk engine (riskService.js)
//   - Integrated advisory (advisoryService.js)
//   - Supabase diagnosis_cases persistence with resilient local fallback
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { diagnoseCropImage } = require('../services/diseaseDetectionService');
const { calculateRisk } = require('../services/riskService');
const { buildAdvisory } = require('../services/advisoryService');
const mlInferenceService = require('../services/mlInferenceService');
const { getDiseasesByCrop } = require('../data/diseaseKnowledgeBase');
const triageService = require('../services/triageService');

const LOCAL_DIAGNOSES_FILE = path.resolve(__dirname, '../data/diagnosis_cases.json');

function saveLocalDiagnosis(record) {
  try {
    // Run rule-based epidemic outbreak triage
    try {
      const triageResult = triageService.evaluateTriageForNewReport(record);
      if (triageResult && triageResult.isOutbreakFlagged) {
        record.is_outbreak_flagged = true;
        record.outbreak_id = triageResult.outbreakAlert?.id;
        record.status = 'Escalated';
      }
    } catch (triageErr) {
      console.warn('[diagnosisController] Triage evaluation warning:', triageErr.message);
    }

    let list = [];
    if (fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
      list = JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]');
    }
    list.unshift(record);
    fs.writeFileSync(LOCAL_DIAGNOSES_FILE, JSON.stringify(list.slice(0, 100), null, 2));
  } catch (err) {
    console.warn('[diagnosisController] Failed to persist local fallback diagnosis:', err.message);
  }
}

function getLocalDiagnoses() {
  try {
    if (fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]');
    }
  } catch {}
  return [];
}

async function runFallbackDiagnosis(cropName) {
  console.warn('[DiagnosisController] Utilizing fallback diagnosis engine for:', cropName);
  const diseasesForCrop = getDiseasesByCrop(cropName);

  if (!diseasesForCrop || diseasesForCrop.length === 0) {
    return {
      crop: cropName || 'Unknown',
      disease: 'Uncertain Image / Low AI Confidence',
      confidence: 50,
      severity_band: 'Low',
      severity_percent: 15,
      requires_expert_review: true,
      ml: {
        model: 'Fallback-RuleEngine',
        version: '1.0.0',
        real_inference: false,
      },
    };
  }

  const picked = diseasesForCrop[0];
  return {
    crop: cropName,
    disease: picked.disease_name,
    confidence: 82,
    severity_band: 'Moderate',
    severity_percent: 45,
    requires_expert_review: false,
    ml: {
      model: 'Fallback-RuleEngine',
      version: '1.0.0',
      real_inference: false,
    },
  };
}

/**
 * POST /api/diagnosis  or  POST /api/diagnose
 * multipart/form-data: image, species, crop, crop_name, farmer_id, farm_id, crop_cycle_id, affected_body_part, symptoms
 */
const createDiagnosis = asyncHandler(async (req, res) => {
  const {
    farmer_id: farmerId,
    farm_id: farmId,
    crop_cycle_id: cropCycleId,
    crop,
    crop_name: cropNameInput,
    crop_stage: cropStageInput,
    species: speciesInput,
    affected_body_part: affectedBodyPart,
    symptoms: symptomsInput,
    animal_tag: animalTag,
    animal_name: animalName,
  } = req.body;

  console.log('[DiagnosisFlow:Backend] Received POST /api/diagnosis request.');

  // 1. Strict Validation: Check for empty / missing image file (Bug #1 fix)
  if (!req.file || !req.file.path || req.file.size === 0) {
    console.warn('[DiagnosisFlow:Backend] 400 Bad Request: No image file provided');
    return res.status(400).json({
      success: false,
      error: 'No image provided',
      message: 'No image provided. Please upload or capture an animal photo.',
    });
  }

  // 2. Strict Validation: Sharp Image Quality & Corruption Gate (Bug #1 & Bug #2 fix)
  const sharp = require('sharp');
  let metadata;
  try {
    metadata = await sharp(req.file.path).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 64 || metadata.height < 64) {
      console.warn('[DiagnosisFlow:Backend] 400 Bad Request: Image resolution too small or unreadable', metadata);
      return res.status(400).json({
        success: false,
        error: 'Corrupt or unreadable image data',
        message: 'Image resolution is too low or file is corrupt. Minimum 64x64 pixels required.',
      });
    }

    const stats = await sharp(req.file.path).stats();
    const avgStdDev = stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;
    if (avgStdDev < 6.0) {
      console.warn('[DiagnosisFlow:Backend] Rejection: Blank or solid-color image (avgStdDev =', avgStdDev, ')');
      return res.status(200).json({
        success: true,
        data: {
          supported: false,
          diagnosisAvailable: false,
          type: 'invalid',
          reason: 'LOW_IMAGE_QUALITY',
          crop: speciesInput || cropNameInput || crop || 'Cattle',
          disease: 'Invalid image — please upload a clear photo of the affected body area (skin, udder, hoof, or mouth)',
          confidence: 0,
          message: 'Invalid image — please upload a clear photo of the affected body area (skin, udder, hoof, or mouth)',
          ml: { model: 'Sharp-QualityGate', real_inference: true },
        },
      });
    }
  } catch (sharpErr) {
    console.error('[DiagnosisFlow:Backend] 400 Bad Request: Corrupt image file:', sharpErr.message);
    return res.status(400).json({
      success: false,
      error: 'Corrupt or unreadable image data',
      message: 'The image could not be decoded. Please upload a valid JPEG/PNG file.',
    });
  }

  // 3. Resolve Farm & Location
  let farm = null;
  const targetFarmId = farmId || 'demo-farm-nashik';

  try {
    const { data: supaFarm, error: farmError } = await supabase
      .from('farms')
      .select('id, latitude, longitude, farm_name, taluka, district')
      .eq('id', targetFarmId)
      .single();

    if (!farmError && supaFarm) farm = supaFarm;
  } catch {}

  // Fallback farm coordinates (Niphad, Nashik, Maharashtra)
  if (!farm) {
    farm = {
      id: targetFarmId,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : 20.085,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : 74.11,
      farm_name: 'Farmer Farm Plot',
      taluka: 'Niphad',
      district: 'Nashik',
    };
  }

  // 4. Resolve Species & Symptoms
  const resolvedSpecies = (
    speciesInput ||
    cropNameInput ||
    crop ||
    'Cattle'
  ).trim();
  const lowerSpecies = resolvedSpecies.toLowerCase();
  const isLivestock = [
    'cattle', 'buffalo', 'goat', 'sheep', 'poultry', 'cow', 'bovine', 'animal', 'livestock'
  ].some((s) => lowerSpecies.includes(s));

  let parsedSymptoms = [];
  try {
    if (typeof symptomsInput === 'string') {
      parsedSymptoms = symptomsInput.startsWith('[') ? JSON.parse(symptomsInput) : [symptomsInput];
    } else if (Array.isArray(symptomsInput)) {
      parsedSymptoms = symptomsInput;
    }
  } catch {
    parsedSymptoms = [String(symptomsInput)];
  }

  console.log('[DiagnosisFlow:Backend] Processing diagnosis request:', {
    species: resolvedSpecies,
    isLivestock,
    filename: req.file.originalname,
    sizeBytes: req.file.size,
    dimensions: `${metadata.width}x${metadata.height}`,
    affectedBodyPart,
    symptoms: parsedSymptoms,
  });

  const imageUrl = `/uploads/${req.file.filename}`;
  const localFilePath = req.file.path || path.join(__dirname, '..', '..', 'uploads', req.file.filename);

  // 5. Run Inference
  let diagnosisResult = null;
  let isMLInference = false;

  if (isLivestock) {
    // Route to Livestock Pathology Engine
    try {
      diagnosisResult = await diagnoseCropImage({
        species: resolvedSpecies,
        cropName: resolvedSpecies,
        imagePath: localFilePath,
        originalFilename: req.file.originalname,
        affectedBodyPart,
        animalTag,
        symptoms: parsedSymptoms,
        latitude: farm.latitude,
        longitude: farm.longitude,
        farmId: farm.id,
        cropStage: cropStageInput,
      });
      isMLInference = true;
    } catch (lErr) {
      console.error('[DiagnosisFlow:Backend] Livestock pathology error:', lErr.message);
    }
  } else {
    // Plant/crop route -> MobileNetV2-PlantVillage ONNX
    try {
      if (mlInferenceService && typeof mlInferenceService.runInference === 'function') {
        diagnosisResult = await mlInferenceService.runInference(localFilePath, resolvedSpecies);
        isMLInference = true;
      }
    } catch (mlErr) {
      console.warn('[DiagnosisFlow:Backend] Crop ML inference notice:', mlErr.message);
    }
  }

  if (!diagnosisResult) {
    diagnosisResult = {
      species: resolvedSpecies,
      crop: resolvedSpecies.toLowerCase(),
      disease: 'Unable to Identify — Unclear or Low AI Confidence',
      type: 'uncertain',
      diagnosisAvailable: false,
      reason: 'LOW_CONFIDENCE',
      confidence: 42,
      severity: 'low',
      severity_band: 'Low',
      severityPercent: 10,
      isUncertain: true,
      message: 'Unable to identify - please upload a clearer photo of the affected animal.',
      ml: { model: 'Fallback-SafetyGate', real_inference: false },
    };
  }

  // 6. Handle Rejection / Invalid Image / Low-Confidence State (Bug #2 fix)
  if (diagnosisResult && (!diagnosisResult.diagnosisAvailable || diagnosisResult.type === 'invalid' || diagnosisResult.reason === 'NOT_A_LIVESTOCK_IMAGE' || diagnosisResult.reason === 'LOW_CONFIDENCE' || (diagnosisResult.confidence && diagnosisResult.confidence < 60))) {
    console.log('[DiagnosisFlow:Backend] Image REJECTED, invalid or low confidence (<60%):', diagnosisResult.reason || diagnosisResult.confidence);
    const friendlyMsg = 'Invalid image — please upload a clear photo of the affected body area (skin, udder, hoof, or mouth)';
    return res.status(200).json({
      success: true,
      data: {
        supported: Boolean(diagnosisResult.supported),
        diagnosisAvailable: false,
        type: 'invalid',
        reason: diagnosisResult.reason || 'LOW_CONFIDENCE',
        crop: diagnosisResult.crop || resolvedSpecies,
        species: resolvedSpecies,
        disease: friendlyMsg,
        confidence: diagnosisResult.confidence || 0,
        needsExpertReview: Boolean(diagnosisResult.needsExpertReview),
        message: friendlyMsg,
        stage: diagnosisResult.stage,
        ml: diagnosisResult.ml || { model: 'Livestock-PathologyEngine', real_inference: isMLInference },
      },
    });
  }

  // 7. Handle Healthy Classification Output (Bug #3 fix)
  const isHealthy = Boolean(
    diagnosisResult.type === 'healthy' ||
    diagnosisResult.is_healthy ||
    (diagnosisResult.disease && diagnosisResult.disease.toLowerCase().includes('healthy'))
  );

  const confidenceScore = typeof diagnosisResult.confidence === 'number'
    ? (diagnosisResult.confidence <= 1 ? Math.round(diagnosisResult.confidence * 100) : diagnosisResult.confidence)
    : 85;

  const isLowConfidence = confidenceScore < 60 || Boolean(diagnosisResult.isUncertain);
  const requiresExpertReview = !isHealthy && Boolean(
    diagnosisResult.requires_expert_review ||
    diagnosisResult.needsExpertReview ||
    isLowConfidence ||
    diagnosisResult.severity_band === 'High'
  );
  const status = isHealthy ? 'healthy' : (requiresExpertReview ? 'expert_review_pending' : 'suspected');
  const severityCapitalized = isHealthy ? 'Low' : (diagnosisResult.severity_band || 'Moderate');

  // 8. Calculate localized risk from live weather & location
  let localizedRisk = null;
  try {
    localizedRisk = await calculateRisk(
      farm,
      { crop_name: resolvedSpecies, crop_stage: cropStageInput || 'lactating' },
      { crop: resolvedSpecies, disease: diagnosisResult.disease, confidence: confidenceScore / 100 }
    );
  } catch (rErr) {
    console.warn('[diagnosisController] Localized risk calculation notice:', rErr.message);
  }

  // 9. Build structured advisory
  const advisoryPayload = {
    predicted_disease: diagnosisResult.disease,
    severity_band: severityCapitalized,
    severity: severityCapitalized.toLowerCase(),
    status,
    isUncertain: isLowConfidence,
    type: isHealthy ? 'healthy' : 'disease',
    is_healthy: isHealthy,
  };
  const structuredAdvisory = buildAdvisory(advisoryPayload, resolvedSpecies);

  // 10. Save case record
  const caseId = uuidv4();
  const caseRecord = {
    id: caseId,
    farmer_id: farmerId || null,
    farm_id: farm.id,
    crop_cycle_id: cropCycleId || null,
    image_url: imageUrl,
    predicted_disease: diagnosisResult.disease,
    confidence: confidenceScore,
    severity_band: severityCapitalized,
    severity_percent: isHealthy ? 5 : (diagnosisResult.severity_percent || (severityCapitalized === 'High' ? 70 : 40)),
    latitude: farm.latitude,
    longitude: farm.longitude,
    status,
    created_at: new Date().toISOString(),
  };

  // Attempt Supabase insert
  try {
    await supabase.from('diagnosis_cases').insert(caseRecord);
  } catch (dbErr) {
    console.warn('[diagnosisController] Supabase insert notice:', dbErr.message);
  }

  // Save to resilient local storage
  saveLocalDiagnosis({ ...caseRecord, crop_name: resolvedSpecies, advisory: structuredAdvisory });

  console.log('[DiagnosisFlow:Backend] Diagnosis completed successfully:', {
    caseId,
    disease: diagnosisResult.disease,
    isHealthy,
    confidence: confidenceScore,
    severity: severityCapitalized,
  });

  // 11. Format clean response matching Phase 2 specification
  const responseData = {
    case_id: caseId,
    id: caseId,
    crop: diagnosisResult.crop || resolvedSpecies.toLowerCase(),
    species: resolvedSpecies,
    disease: diagnosisResult.disease,
    type: isHealthy ? 'healthy' : (diagnosisResult.type || 'disease'),
    is_healthy: isHealthy,
    confidence: Number((confidenceScore / 100).toFixed(2)),
    severity: severityCapitalized.toLowerCase(),
    severity_band: severityCapitalized,
    severity_percent: caseRecord.severity_percent,
    image_url: imageUrl,
    is_uncertain: isLowConfidence,
    requires_expert_review: requiresExpertReview,
    status,
    supported: true,
    diagnosisAvailable: true,
    scientific_name: diagnosisResult.scientific_name || null,
    ml: diagnosisResult.ml || {
      model: isLivestock ? 'Livestock-PathologyEngine' : 'MobileNetV2-PlantVillage',
      real_inference: isMLInference,
    },
    message: isHealthy
      ? 'No clinical disease symptoms detected. The animal appears healthy and active.'
      : isLowConfidence
      ? 'Unable to identify - please upload a clearer photo of the affected animal'
      : `Detected ${diagnosisResult.disease} with ${severityCapitalized} severity. Follow recommended veterinary care steps.`,
    risk: localizedRisk
      ? {
          score: localizedRisk.risk_score,
          level: localizedRisk.risk_level,
          reasons: localizedRisk.reasons,
          breakdown: localizedRisk.breakdown,
          factors: localizedRisk.factors,
        }
      : undefined,
    advisory: structuredAdvisory,
  };

  res.status(201).json({
    success: true,
    data: responseData,
  });
});

/**
 * GET /api/diagnosis/:caseId
 */
const getDiagnosisById = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  let data = null;
  try {
    const { data: supaData, error } = await supabase
      .from('diagnosis_cases')
      .select('*, crop_cycle:crop_cycle_id ( id, crop_name, variety, crop_stage )')
      .eq('id', caseId)
      .single();
    if (!error && supaData) data = supaData;
  } catch {}

  if (!data) {
    const localCases = getLocalDiagnoses();
    data = localCases.find((c) => c.id === caseId || c.case_id === caseId);
  }

  if (!data) {
    throw new ApiError(404, 'Diagnosis case not found.');
  }

  const cropName = data.crop_name || data.crop_cycle?.crop_name || 'Onion';
  const advisory = data.advisory || buildAdvisory(data, cropName);

  res.json({
    success: true,
    data: {
      ...data,
      crop_name: cropName,
      crop: cropName.toLowerCase(),
      advisory,
    },
  });
});

/**
 * GET /api/diagnosis/farm/:farmId/latest
 */
const getLatestDiagnosisByFarm = asyncHandler(async (req, res) => {
  const { farmId } = req.params;
  const { crop } = req.query;

  let cases = [];
  try {
    const { data, error } = await supabase
      .from('diagnosis_cases')
      .select('*, crop_cycle:crop_cycle_id ( id, crop_name, variety, crop_stage )')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    if (!error && data) cases = data;
  } catch {}

  if (cases.length === 0) {
    const local = getLocalDiagnoses();
    cases = local.filter((c) => c.farm_id === farmId || !farmId);
  }

  if (cases.length === 0) {
    return res.json({ success: true, data: null });
  }

  let matchingCase = cases[0];
  if (crop) {
    const cropLower = crop.toLowerCase().trim();
    const found = cases.find((c) => {
      const caseCrop = (c.crop_cycle?.crop_name || c.crop_name || '').toLowerCase().trim();
      return caseCrop === cropLower || caseCrop.includes(cropLower) || cropLower.includes(caseCrop);
    });
    if (found) matchingCase = found;
  }

  const cropName = matchingCase.crop_cycle?.crop_name || matchingCase.crop_name || (crop || 'Onion');
  const advisory = matchingCase.advisory || buildAdvisory(matchingCase, cropName);

  res.json({
    success: true,
    data: {
      ...matchingCase,
      crop_name: cropName,
      crop: cropName.toLowerCase(),
      advisory,
    },
  });
});

/**
 * GET /api/diagnosis/farmer/:farmerId/latest
 */
const getLatestDiagnosisByFarmer = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;
  const { crop } = req.query;

  let cases = [];
  try {
    const { data, error } = await supabase
      .from('diagnosis_cases')
      .select('*, crop_cycle:crop_cycle_id ( id, crop_name, variety, crop_stage )')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (!error && data) cases = data;
  } catch {}

  if (cases.length === 0) {
    const local = getLocalDiagnoses();
    cases = local.filter((c) => c.farmer_id === farmerId || !farmerId);
  }

  if (cases.length === 0) {
    return res.json({ success: true, data: null });
  }

  let matchingCase = cases[0];
  if (crop) {
    const cropLower = crop.toLowerCase().trim();
    const found = cases.find((c) => {
      const caseCrop = (c.crop_cycle?.crop_name || c.crop_name || '').toLowerCase().trim();
      return caseCrop === cropLower || caseCrop.includes(cropLower) || cropLower.includes(caseCrop);
    });
    if (found) matchingCase = found;
  }

  const cropName = matchingCase.crop_cycle?.crop_name || matchingCase.crop_name || (crop || 'Onion');
  const advisory = matchingCase.advisory || buildAdvisory(matchingCase, cropName);

  res.json({
    success: true,
    data: {
      ...matchingCase,
      crop_name: cropName,
      crop: cropName.toLowerCase(),
      advisory,
    },
  });
});

/**
 * GET /api/ml/health
 * Returns ML engine status, loaded model, supported classes count, latency specs.
 */
const getMLHealth = asyncHandler(async (req, res) => {
  const status = mlInferenceService ? mlInferenceService.getHealthStatus() : { available: false };
  res.json({
    success: Boolean(status.available),
    data: status,
  });
});

/**
 * GET /api/diagnosis
 * Fetches all diagnosis cases with optional regional, status, and report_type filtering.
 * Used by Veterinary Official Dashboard to monitor cases across talukas and districts.
 */
const getAllDiagnosisCases = asyncHandler(async (req, res) => {
  const { status, district, taluka, species, report_type, limit = 100 } = req.query;
  let cases = getLocalDiagnoses();

  if (status && status !== 'all' && status !== 'All') {
    const sLower = status.toLowerCase().replace(/\s+/g, '_');
    cases = cases.filter((c) => {
      const cStatus = (c.status || '').toLowerCase().replace(/\s+/g, '_');
      return cStatus === sLower;
    });
  }
  if (district) {
    cases = cases.filter((c) => (c.district || '').toLowerCase().includes(district.toLowerCase()));
  }
  if (taluka) {
    cases = cases.filter((c) => (c.taluka || '').toLowerCase().includes(taluka.toLowerCase()));
  }
  if (species) {
    cases = cases.filter((c) => (c.crop_name || c.species || '').toLowerCase().includes(species.toLowerCase()));
  }
  if (report_type) {
    cases = cases.filter((c) => (c.report_type || 'symptom') === report_type);
  }

  res.json({
    success: true,
    data: cases.slice(0, parseInt(limit, 10)),
    count: cases.length,
  });
});

/**
 * PATCH /api/diagnosis/:caseId/status
 * Veterinary Official updates case status (New -> Under Review -> Sample Collected -> Escalated -> Resolved)
 * and records official audit log history.
 */
const updateCaseStatus = asyncHandler(async (req, res) => {
  const { caseId } = req.params;
  const { status, notes, updated_by, lab_referral, sample_id } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required.');
  }

  const list = getLocalDiagnoses();
  const target = list.find((c) => c.id === caseId || c.case_id === caseId);

  if (!target) {
    throw new ApiError(404, 'Case record not found.');
  }

  const previousStatus = target.status || 'New';
  target.status = status;
  if (!target.status_history) {
    target.status_history = [];
  }

  target.status_history.push({
    from_status: previousStatus,
    to_status: status,
    timestamp: new Date().toISOString(),
    updated_by: updated_by || 'Veterinary Officer',
    notes: notes || '',
    sample_id: sample_id || undefined,
    lab_referral: lab_referral || undefined,
  });

  if (notes) target.vet_notes = notes;
  if (lab_referral) target.lab_referral = lab_referral;
  if (sample_id) target.sample_id = sample_id;
  target.updated_at = new Date().toISOString();

  // Persist to local JSON fallback
  try {
    fs.writeFileSync(LOCAL_DIAGNOSES_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    console.warn('[diagnosisController] Failed to persist updated case:', err.message);
  }

  // Also attempt Supabase update
  try {
    await supabase.from('diagnosis_cases').update({
      status,
      updated_at: new Date().toISOString(),
    }).eq('id', caseId);
  } catch {}

  res.json({
    success: true,
    data: target,
    message: `Case status successfully updated to "${status}".`,
  });
});

module.exports = {
  createDiagnosis,
  getDiagnosisById,
  getAllDiagnosisCases,
  updateCaseStatus,
  getLatestDiagnosisByFarm,
  getLatestDiagnosisByFarmer,
  getMLHealth,
};

