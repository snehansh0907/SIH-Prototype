// =========================================================
// Advisory Controller
// =========================================================
// GET /api/advisory/:caseId
// =========================================================

const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { buildAdvisory } = require('../services/advisoryService');

const getAdvisoryForCase = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const { data: diagnosisCase, error } = await supabase
    .from('diagnosis_cases')
    .select('*, crop_cycle:crop_cycle_id ( crop_name )')
    .eq('id', caseId)
    .single();

  if (error || !diagnosisCase) throw new ApiError(404, 'Diagnosis case not found.');

  const cropName = diagnosisCase.crop_cycle?.crop_name || null;
  const advisory = buildAdvisory(diagnosisCase, cropName);

  res.json({ success: true, data: advisory });
});

module.exports = { getAdvisoryForCase };
