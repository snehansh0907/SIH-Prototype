// =========================================================
// Expert Controller
// =========================================================
// GET  /api/expert/cases/pending
// GET  /api/expert/cases/:caseId
// POST /api/expert/review
//
// This is the critical link that connects diagnosis -> expert
// review -> confirmed status -> hotspot map -> risk scores for
// nearby farms.
// =========================================================

const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/expert/cases/pending
 * Cases that need expert attention.
 */
const getPendingCases = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('diagnosis_cases')
    .select('*')
    .in('status', ['expert_review_pending', 'suspected'])
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, `Failed to fetch pending cases: ${error.message}`);

  res.json({ success: true, data });
});

/**
 * GET /api/expert/cases/:caseId
 */
const getCaseDetails = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const { data: diagnosisCase, error } = await supabase
    .from('diagnosis_cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (error || !diagnosisCase) throw new ApiError(404, 'Case not found.');

  const { data: reviews } = await supabase
    .from('expert_reviews')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  res.json({ success: true, data: { case: diagnosisCase, reviews: reviews || [] } });
});

/**
 * POST /api/expert/review
 * body: { case_id, expert_id, review_status, expert_diagnosis, remarks }
 * review_status: 'confirmed' | 'corrected' | 'rejected'
 *
 * This is the critical connection point:
 *   confirmed/corrected -> diagnosis_cases.status updated
 *   -> case now appears on the hotspot map
 *   -> nearby farms' risk scores increase on their next /api/risk call
 */
const submitExpertReview = asyncHandler(async (req, res) => {
  const { case_id: caseId, expert_id: expertId, review_status: reviewStatus, expert_diagnosis: expertDiagnosis, remarks } =
    req.body;

  if (!caseId || !reviewStatus) {
    throw new ApiError(400, 'case_id and review_status are required.');
  }

  const validStatuses = ['confirmed', 'corrected', 'rejected'];
  if (!validStatuses.includes(reviewStatus)) {
    throw new ApiError(400, `review_status must be one of: ${validStatuses.join(', ')}`);
  }

  // Fetch the case to get the AI prediction for the review record
  const { data: diagnosisCase, error: caseError } = await supabase
    .from('diagnosis_cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError || !diagnosisCase) throw new ApiError(404, 'Diagnosis case not found.');

  // 1. Insert the expert review record
  const reviewRecord = {
    id: uuidv4(),
    case_id: caseId,
    expert_id: expertId || null,
    ai_prediction: diagnosisCase.predicted_disease,
    expert_diagnosis: expertDiagnosis || diagnosisCase.predicted_disease,
    review_status: reviewStatus,
    remarks: remarks || null,
    reviewed_at: new Date().toISOString(),
  };

  const { data: insertedReview, error: reviewError } = await supabase
    .from('expert_reviews')
    .insert(reviewRecord)
    .select()
    .single();

  if (reviewError) throw new ApiError(500, `Failed to save expert review: ${reviewError.message}`);

  // 2. Update the diagnosis case status based on the review
  //    confirmed -> 'confirmed', corrected -> 'corrected', rejected -> stays visible but marked resolved
  let newCaseStatus = diagnosisCase.status;
  const caseUpdates = {};

  if (reviewStatus === 'confirmed') {
    newCaseStatus = 'confirmed';
  } else if (reviewStatus === 'corrected') {
    newCaseStatus = 'corrected';
    if (expertDiagnosis) caseUpdates.predicted_disease = expertDiagnosis;
  } else if (reviewStatus === 'rejected') {
    newCaseStatus = 'resolved';
  }

  caseUpdates.status = newCaseStatus;

  const { data: updatedCase, error: updateError } = await supabase
    .from('diagnosis_cases')
    .update(caseUpdates)
    .eq('id', caseId)
    .select()
    .single();

  if (updateError) throw new ApiError(500, `Failed to update case status: ${updateError.message}`);

  res.json({
    success: true,
    data: {
      review: insertedReview,
      case: updatedCase,
      note:
        newCaseStatus === 'confirmed' || newCaseStatus === 'corrected'
          ? 'Case is now confirmed and will appear on the hotspot map, influencing risk scores for nearby farms.'
          : 'Case status updated.',
    },
  });
});

module.exports = { getPendingCases, getCaseDetails, submitExpertReview };
