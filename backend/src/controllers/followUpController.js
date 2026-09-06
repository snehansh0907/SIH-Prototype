// =========================================================
// Follow-Up Controller
// =========================================================
// POST /api/follow-ups
// GET  /api/follow-ups/:caseId
// =========================================================

const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * POST /api/follow-ups
 * body: { case_id, farmer_id, status, notes, new_image_url }
 * status: 'better' | 'same' | 'worse'
 */
const createFollowUp = asyncHandler(async (req, res) => {
  const { case_id: caseId, farmer_id: farmerId, status, notes, new_image_url: newImageUrl } = req.body;

  if (!caseId || !status) {
    throw new ApiError(400, 'case_id and status are required.');
  }

  const validStatuses = ['better', 'same', 'worse'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `status must be one of: ${validStatuses.join(', ')}`);
  }

  const newFollowUp = {
    id: uuidv4(),
    case_id: caseId,
    farmer_id: farmerId || null,
    status,
    notes: notes || null,
    new_image_url: newImageUrl || null,
  };

  const { data, error } = await supabase.from('follow_ups').insert(newFollowUp).select().single();
  if (error) throw new ApiError(500, `Failed to save follow-up: ${error.message}`);

  const recommendation =
    status === 'worse' ? 'Upload a new photo or contact an expert.' : null;

  // If it's getting worse, flag the case for expert review again
  if (status === 'worse') {
    await supabase
      .from('diagnosis_cases')
      .update({ status: 'expert_review_pending' })
      .eq('id', caseId);
  }

  res.status(201).json({
    success: true,
    data: { follow_up: data, recommendation },
  });
});

/**
 * GET /api/follow-ups/:caseId
 */
const getFollowUpsByCase = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, `Failed to fetch follow-ups: ${error.message}`);

  res.json({ success: true, data });
});

module.exports = { createFollowUp, getFollowUpsByCase };
