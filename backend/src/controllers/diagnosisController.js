// =========================================================
// Diagnosis Controller
// =========================================================
// Handles crop image upload + disease diagnosis.
//
// >>> ML INTEGRATION POINT <<<
// The real ML model is not ready yet. The function
// `runMockDiagnosis()` below is a clean, swappable mock layer.
// When the real ML API is ready, replace the BODY of
// `runMockDiagnosis()` with a call to that API (e.g. via fetch/axios),
// keeping the same input/output shape so nothing else in the
// codebase needs to change.
// =========================================================

const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { getDiseasesByCrop } = require('../data/diseaseKnowledgeBase');

// ---------------------------------------------------------
// MOCK DIAGNOSIS LAYER (replace body when real ML is ready)
// ---------------------------------------------------------
/**
 * @param {string} cropName - e.g. "Tomato", "Cotton", "Soybean"
 * @param {string} imagePath - local path/URL of the uploaded image (unused in mock)
 * @returns {Promise<{disease: string, confidence: number, severity_band: string, severity_percent: number}>}
 */
async function runMockDiagnosis(cropName, imagePath) {
  // >>> REPLACE THIS FUNCTION BODY WITH A REAL ML API CALL LATER <<<
  // Example (future):
  //   const response = await fetch(ML_API_URL, { method: 'POST', body: formData });
  //   const result = await response.json();
  //   return { disease: result.disease, confidence: result.confidence, ... };

  const diseasesForCrop = getDiseasesByCrop(cropName);

  // Fall back to a generic "healthy" style result if crop isn't in our KB
  if (!diseasesForCrop || diseasesForCrop.length === 0) {
    return {
      disease: 'Unknown / Not in supported crop list',
      confidence: 50,
      severity_band: 'Low',
      severity_percent: 15,
    };
  }

  // Randomly pick one disease from the crop's known diseases (deterministic-ish demo behaviour)
  const picked = diseasesForCrop[Math.floor(Math.random() * diseasesForCrop.length)];

  // Generate a realistic confidence + severity for demo purposes
  const confidence = Math.floor(Math.random() * (97 - 78 + 1)) + 78; // 78-97%
  const severityPercent = Math.floor(Math.random() * (85 - 10 + 1)) + 10; // 10-85%

  let severityBand = 'Low';
  if (severityPercent > 65) severityBand = 'Severe';
  else if (severityPercent > 40) severityBand = 'High';
  else if (severityPercent > 20) severityBand = 'Moderate';

  return {
    disease: picked.disease_name,
    confidence,
    severity_band: severityBand,
    severity_percent: severityPercent,
  };
}
// ---------------------------------------------------------
// END MOCK DIAGNOSIS LAYER
// ---------------------------------------------------------

/**
 * POST /api/diagnosis
 * multipart/form-data: image, farmer_id, farm_id, crop_cycle_id
 */
const createDiagnosis = asyncHandler(async (req, res) => {
  const { farmer_id: farmerId, farm_id: farmId, crop_cycle_id: cropCycleId } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'A crop image file is required.');
  }
  if (!farmId) {
    throw new ApiError(400, 'farm_id is required.');
  }

  // Look up the farm to get location + get the crop name from the crop cycle
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('id, latitude, longitude')
    .eq('id', farmId)
    .single();

  if (farmError || !farm) {
    throw new ApiError(404, 'Farm not found for the given farm_id.');
  }

  let cropName = 'Unknown';
  if (cropCycleId) {
    const { data: cropCycle } = await supabase
      .from('crop_cycles')
      .select('crop_name')
      .eq('id', cropCycleId)
      .single();
    if (cropCycle) cropName = cropCycle.crop_name;
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  // Run diagnosis (currently mock; swap for real ML call later)
  const result = await runMockDiagnosis(cropName, imageUrl);

  const requiresExpertReview = result.confidence < 80 || result.severity_band === 'Severe';
  const status = requiresExpertReview ? 'expert_review_pending' : 'suspected';

  const newCase = {
    id: uuidv4(),
    farmer_id: farmerId || null,
    farm_id: farmId,
    crop_cycle_id: cropCycleId || null,
    image_url: imageUrl,
    predicted_disease: result.disease,
    confidence: result.confidence,
    severity_band: result.severity_band,
    severity_percent: result.severity_percent,
    latitude: farm.latitude,
    longitude: farm.longitude,
    status,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('diagnosis_cases')
    .insert(newCase)
    .select()
    .single();

  if (insertError) {
    throw new ApiError(500, `Failed to save diagnosis case: ${insertError.message}`);
  }

  res.status(201).json({
    success: true,
    data: {
      case_id: inserted.id,
      crop: cropName,
      disease: inserted.predicted_disease,
      confidence: inserted.confidence,
      severity_band: inserted.severity_band,
      severity_percent: inserted.severity_percent,
      requires_expert_review: requiresExpertReview,
    },
  });
});

/**
 * GET /api/diagnosis/:caseId
 */
const getDiagnosisById = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const { data, error } = await supabase
    .from('diagnosis_cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Diagnosis case not found.');
  }

  res.json({ success: true, data });
});

module.exports = { createDiagnosis, getDiagnosisById, runMockDiagnosis };
