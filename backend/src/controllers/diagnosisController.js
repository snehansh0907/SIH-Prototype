// =========================================================
// Diagnosis Controller
// =========================================================
// Handles crop image upload + AI disease diagnosis + risk calculation.
// Connects:
//   - Pluggable AI disease detection (diseaseDetectionService.js)
//   - Agronomic risk engine (riskEngine.js / riskService.js)
//   - Integrated Pest Management advisory (advisoryService.js)
//   - Supabase diagnosis_cases persistence with resilient fallback
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { diagnoseCropImage } = require('../services/diseaseDetectionService');
const { calculateRisk } = require('../services/riskService');
const { buildAdvisory } = require('../services/advisoryService');

const LOCAL_DIAGNOSES_FILE = path.resolve(__dirname, '../data/diagnosis_cases.json');

function saveLocalDiagnosis(record) {
  try {
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

/**
 * POST /api/diagnosis  or  POST /api/diagnose
 * multipart/form-data: image, crop, crop_name, farmer_id, farm_id, crop_cycle_id, crop_stage
 */
const createDiagnosis = asyncHandler(async (req, res) => {
  const {
    farmer_id: farmerId,
    farm_id: farmId,
    crop_cycle_id: cropCycleId,
    crop,
    crop_name: cropNameInput,
    crop_stage: cropStageInput,
  } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'A crop image file is required.');
  }

  // 1. Resolve Farm & Location
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

  // 2. Resolve Crop Name
  let cropName = cropNameInput || crop || null;
  let cropStage = cropStageInput || 'vegetative';

  if (!cropName && cropCycleId) {
    try {
      const { data: cropCycle } = await supabase
        .from('crop_cycles')
        .select('crop_name, crop_stage')
        .eq('id', cropCycleId)
        .single();
      if (cropCycle) {
        cropName = cropCycle.crop_name;
        if (cropCycle.crop_stage) cropStage = cropCycle.crop_stage;
      }
    } catch {}
  }

  // Default to Onion if unspecified (primary SIH Maharashtra demo crop)
  if (!cropName || cropName === 'Unknown') {
    cropName = 'Onion';
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const localFilePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);

  // 3. Run AI Disease / Pest Analysis (Pluggable Engine)
  const aiResult = await diagnoseCropImage({
    cropName,
    imagePath: localFilePath,
    originalFilename: req.file.originalname,
    latitude: farm.latitude,
    longitude: farm.longitude,
    farmId: farm.id,
    cropStage,
  });

  // Confidence & Severity calculations
  const confidence = aiResult.confidence;
  const isLowConfidence = confidence < 0.60 || aiResult.isUncertain;
  const requiresExpertReview = isLowConfidence || aiResult.severity === 'high' || aiResult.severity === 'severe';
  const status = isLowConfidence || requiresExpertReview ? 'expert_review_pending' : 'suspected';

  // Capitalize severity band for UI
  const severityCapitalized =
    aiResult.severity === 'high' || aiResult.severity === 'severe'
      ? 'High'
      : aiResult.severity === 'low'
      ? 'Low'
      : 'Moderate';

  // 4. Calculate localized risk from live weather & location
  let localizedRisk = null;
  try {
    localizedRisk = await calculateRisk(
      farm,
      { crop_name: cropName, crop_stage: cropStage },
      { crop: cropName, disease: aiResult.disease, confidence }
    );
  } catch (rErr) {
    console.warn('[diagnosisController] Localized risk calculation notice:', rErr.message);
  }

  // 5. Build structured IPM advisory
  const advisoryPayload = {
    predicted_disease: aiResult.disease,
    severity_band: severityCapitalized,
    severity: aiResult.severity,
    status,
    isUncertain: isLowConfidence,
  };
  const structuredAdvisory = buildAdvisory(advisoryPayload, cropName);

  // 6. Save case record
  const caseId = uuidv4();
  const caseRecord = {
    id: caseId,
    farmer_id: farmerId || null,
    farm_id: farm.id,
    crop_cycle_id: cropCycleId || null,
    image_url: imageUrl,
    predicted_disease: aiResult.disease,
    confidence: Math.round(confidence * 100),
    severity_band: severityCapitalized,
    severity_percent: aiResult.severityPercent || (severityCapitalized === 'High' ? 70 : 40),
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
  // Also save to resilient local storage
  saveLocalDiagnosis({ ...caseRecord, crop_name: cropName, advisory: structuredAdvisory });

  // 7. Format clean response matching Phase 2 specification
  const responseData = {
    case_id: caseId,
    id: caseId,
    crop: aiResult.crop || cropName.toLowerCase(),
    disease: aiResult.disease,
    type: aiResult.type || 'disease',
    confidence: Number(confidence.toFixed(2)),
    severity: aiResult.severity,
    severity_band: severityCapitalized,
    severity_percent: caseRecord.severity_percent,
    image_url: imageUrl,
    is_uncertain: isLowConfidence,
    requires_expert_review: requiresExpertReview,
    status,
    message: isLowConfidence
      ? 'Unable to confidently identify the problem. Please capture another clear image or request expert verification.'
      : undefined,
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

module.exports = {
  createDiagnosis,
  getDiagnosisById,
  getLatestDiagnosisByFarm,
  getLatestDiagnosisByFarmer,
};
