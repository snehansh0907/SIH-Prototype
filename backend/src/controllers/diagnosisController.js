// =========================================================
// Pashu Sarthak - Diagnosis Controller
// =========================================================
// Handles animal image upload + AI livestock disease diagnosis + risk calculation.
// Connects:
//   - Pluggable AI livestock disease detection (diseaseDetectionService.js)
//   - Livestock Bioclimatic THI Risk Engine (riskService.js)
//   - Clinical Veterinary Advisory Service (advisoryService.js)
//   - Supabase diagnosis_cases persistence with resilient JSON fallback
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
 * multipart/form-data: image, species, crop, affected_body_part, animal_tag, owner_id, farmer_id, shed_id, farm_id
 */
const createDiagnosis = asyncHandler(async (req, res) => {
  const {
    farmer_id: farmerId,
    owner_id: ownerId,
    farm_id: farmId,
    shed_id: shedId,
    crop_cycle_id: cropCycleId,
    unit_id: unitId,
    crop,
    crop_name: cropNameInput,
    species: speciesInput,
    animal_tag: animalTagInput,
    tag_number: tagNumberInput,
    affected_body_part: bodyPartInput,
    body_part: bodyPartAlt,
  } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'An animal photo or lesion image file is required.');
  }

  const resolvedOwnerId = ownerId || farmerId;
  const targetShedId = shedId || farmId || 'demo-shed-nashik';

  // 1. Resolve Herd / Shed & Location
  let shed = null;
  try {
    const { data: supaHerd } = await supabase
      .from('herds')
      .select('id, latitude, longitude, shed_name, farm_name, taluka, district, species, breed')
      .eq('id', targetShedId)
      .single();
    if (supaHerd) shed = supaHerd;
  } catch {}

  if (!shed) {
    try {
      const { data: supaFarm } = await supabase
        .from('farms')
        .select('id, latitude, longitude, farm_name, taluka, district')
        .eq('id', targetShedId)
        .single();
      if (supaFarm) shed = supaFarm;
    } catch {}
  }

  // Fallback shed coordinates (Niphad, Nashik, Maharashtra)
  if (!shed) {
    shed = {
      id: targetShedId,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : 20.085,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : 74.11,
      shed_name: 'Livestock Owner Dairy Gotha',
      farm_name: 'Livestock Owner Dairy Gotha',
      taluka: 'Niphad',
      district: 'Nashik',
      species: 'Cattle',
      breed: 'Gir',
    };
  }

  // 2. Resolve Species & Body Region
  let species = speciesInput || cropNameInput || crop || shed.species || 'Cattle';
  const affectedBodyPart = bodyPartInput || bodyPartAlt || 'skin';
  const animalTag = animalTagInput || tagNumberInput || '';

  const imageUrl = `/uploads/${req.file.filename}`;
  const localFilePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);

  // 3. Run AI Disease Detection (LSD vs FMD vs Healthy vs Uncertain)
  const aiResult = await diagnoseCropImage({
    species,
    cropName: species,
    imagePath: localFilePath,
    originalFilename: req.file.originalname,
    affectedBodyPart,
    animalTag,
    latitude: shed.latitude,
    longitude: shed.longitude,
    farmId: shed.id,
  });

  const confidence = aiResult.confidence;
  const isLowConfidence = confidence < 0.60 || aiResult.isUncertain;
  const requiresExpertReview = isLowConfidence || aiResult.severity === 'high' || aiResult.severity === 'severe';
  const status = isLowConfidence || requiresExpertReview ? 'expert_review_pending' : 'suspected';

  const severityCapitalized =
    aiResult.severity === 'high' || aiResult.severity === 'severe'
      ? 'High'
      : aiResult.severity === 'low'
      ? 'Low'
      : 'Moderate';

  // 4. Calculate localized risk (Livestock THI heat stress & vector outbreaks)
  let localizedRisk = null;
  try {
    localizedRisk = await calculateRisk(
      shed,
      { species, crop_name: species, breed: shed.breed || 'Gir' },
      { species, crop: species, disease: aiResult.disease, confidence }
    );
  } catch (rErr) {
    console.warn('[diagnosisController] Livestock risk calculation notice:', rErr.message);
  }

  // 5. Build structured Veterinary Advisory
  const advisoryPayload = {
    predicted_disease: aiResult.disease,
    species,
    severity_band: severityCapitalized,
    severity: aiResult.severity,
    status,
    isUncertain: isLowConfidence,
  };
  const structuredAdvisory = buildAdvisory(advisoryPayload, species);

  // 6. Save case record
  const caseId = uuidv4();
  const caseRecord = {
    id: caseId,
    farmer_id: resolvedOwnerId || null,
    owner_id: resolvedOwnerId || null,
    farm_id: shed.id,
    herd_id: shed.id,
    crop_cycle_id: unitId || cropCycleId || null,
    animal_unit_id: unitId || cropCycleId || null,
    image_url: imageUrl,
    predicted_disease: aiResult.disease,
    species,
    affected_body_part: aiResult.affectedBodyPart || affectedBodyPart,
    animal_tag: animalTag,
    confidence: Math.round(confidence * 100),
    severity_band: severityCapitalized,
    severity_percent: aiResult.severityPercent || (severityCapitalized === 'High' ? 70 : 40),
    latitude: shed.latitude,
    longitude: shed.longitude,
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
  saveLocalDiagnosis({
    ...caseRecord,
    species,
    crop_name: species,
    crop: species.toLowerCase(),
    advisory: structuredAdvisory,
  });

  // 7. Format clean response matching Phase 2 specification
  const responseData = {
    case_id: caseId,
    id: caseId,
    species,
    crop: species.toLowerCase(),
    crop_name: species,
    affected_body_part: aiResult.affectedBodyPart || affectedBodyPart,
    animal_tag: animalTag,
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
      ? 'Unable to confidently identify the livestock condition. Please capture a clear, well-lit photo of the skin nodules, muzzle, or hooves, or request veterinary officer verification.'
      : aiResult.message || undefined,
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
    const { data: supaData } = await supabase
      .from('diagnosis_cases')
      .select('*')
      .eq('id', caseId)
      .single();
    if (supaData) data = supaData;
  } catch {}

  if (!data) {
    const localCases = getLocalDiagnoses();
    data = localCases.find((c) => c.id === caseId || c.case_id === caseId);
  }

  if (!data) {
    throw new ApiError(404, 'Diagnosis case not found.');
  }

  const species = data.species || data.crop_name || 'Cattle';
  const advisory = data.advisory || buildAdvisory(data, species);

  res.json({
    success: true,
    data: {
      ...data,
      species,
      crop_name: species,
      crop: species.toLowerCase(),
      advisory,
    },
  });
});

/**
 * GET /api/diagnosis/farm/:farmId/latest or /api/diagnosis/shed/:shedId/latest
 */
const getLatestDiagnosisByFarm = asyncHandler(async (req, res) => {
  const { farmId } = req.params;
  const { crop, species } = req.query;

  let cases = [];
  try {
    const { data } = await supabase
      .from('diagnosis_cases')
      .select('*')
      .or(`farm_id.eq.${farmId},herd_id.eq.${farmId}`)
      .order('created_at', { ascending: false });
    if (data) cases = data;
  } catch {}

  if (cases.length === 0) {
    const local = getLocalDiagnoses();
    cases = local.filter((c) => c.farm_id === farmId || c.herd_id === farmId || !farmId);
  }

  if (cases.length === 0) {
    return res.json({ success: true, data: null });
  }

  let matchingCase = cases[0];
  const filterKey = (species || crop || '').toLowerCase().trim();
  if (filterKey) {
    const found = cases.find((c) => {
      const caseSpecies = (c.species || c.crop_name || '').toLowerCase().trim();
      return caseSpecies === filterKey || caseSpecies.includes(filterKey) || filterKey.includes(caseSpecies);
    });
    if (found) matchingCase = found;
  }

  const resolvedSpecies = matchingCase.species || matchingCase.crop_name || (species || crop || 'Cattle');
  const advisory = matchingCase.advisory || buildAdvisory(matchingCase, resolvedSpecies);

  res.json({
    success: true,
    data: {
      ...matchingCase,
      species: resolvedSpecies,
      crop_name: resolvedSpecies,
      crop: resolvedSpecies.toLowerCase(),
      advisory,
    },
  });
});

/**
 * GET /api/diagnosis/farmer/:farmerId/latest or /api/diagnosis/owner/:ownerId/latest
 */
const getLatestDiagnosisByFarmer = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;
  const { crop, species } = req.query;

  let cases = [];
  try {
    const { data } = await supabase
      .from('diagnosis_cases')
      .select('*')
      .or(`farmer_id.eq.${farmerId},owner_id.eq.${farmerId}`)
      .order('created_at', { ascending: false });
    if (data) cases = data;
  } catch {}

  if (cases.length === 0) {
    const local = getLocalDiagnoses();
    cases = local.filter((c) => c.farmer_id === farmerId || c.owner_id === farmerId || !farmerId);
  }

  if (cases.length === 0) {
    return res.json({ success: true, data: null });
  }

  let matchingCase = cases[0];
  const filterKey = (species || crop || '').toLowerCase().trim();
  if (filterKey) {
    const found = cases.find((c) => {
      const caseSpecies = (c.species || c.crop_name || '').toLowerCase().trim();
      return caseSpecies === filterKey || caseSpecies.includes(filterKey) || filterKey.includes(caseSpecies);
    });
    if (found) matchingCase = found;
  }

  const resolvedSpecies = matchingCase.species || matchingCase.crop_name || (species || crop || 'Cattle');
  const advisory = matchingCase.advisory || buildAdvisory(matchingCase, resolvedSpecies);

  res.json({
    success: true,
    data: {
      ...matchingCase,
      species: resolvedSpecies,
      crop_name: resolvedSpecies,
      crop: resolvedSpecies.toLowerCase(),
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
