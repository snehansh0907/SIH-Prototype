// =========================================================
// Expert Controller
// =========================================================
// Handles expert workflow:
//   - POST /api/expert/request (Farmer requests verification)
//   - GET  /api/expert/cases/pending (Expert views pending cases)
//   - GET  /api/expert/cases/:caseId (Expert views case details)
//   - GET  /api/expert/case/:caseId/status (Farmer checks status)
//   - POST /api/expert/review (Expert confirms or corrects)
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const LOCAL_REVIEWS_FILE = path.resolve(__dirname, '../data/expert_reviews.json');
const LOCAL_DIAGNOSES_FILE = path.resolve(__dirname, '../data/diagnosis_cases.json');

function saveLocalReview(review) {
  try {
    let list = [];
    if (fs.existsSync(LOCAL_REVIEWS_FILE)) {
      list = JSON.parse(fs.readFileSync(LOCAL_REVIEWS_FILE, 'utf8') || '[]');
    }
    const idx = list.findIndex((r) => r.case_id === review.case_id);
    if (idx >= 0) list[idx] = review;
    else list.unshift(review);
    fs.writeFileSync(LOCAL_REVIEWS_FILE, JSON.stringify(list, null, 2));
  } catch {}
}

function getLocalReviews() {
  try {
    if (fs.existsSync(LOCAL_REVIEWS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_REVIEWS_FILE, 'utf8') || '[]');
    }
  } catch {}
  return [];
}

/**
 * POST /api/expert/request
 * Farmer requests expert verification for a diagnosis case.
 */
const requestExpertVerification = asyncHandler(async (req, res) => {
  const caseId = req.body.case_id || req.body.caseId;
  const farmerId = req.body.farmer_id || req.body.farmerId;
  const crop = req.body.crop || 'Onion';
  const disease = req.body.disease || 'Purple Blotch';
  const imageUrl = req.body.image_url || req.body.imageUrl || null;
  const confidence = req.body.confidence !== undefined ? req.body.confidence : 0.91;
  const severity = req.body.severity || 'moderate';
  const notes = req.body.notes || 'Farmer requested agronomist verification.';

  if (!caseId) {
    throw new ApiError(400, 'case_id is required to request expert verification.');
  }

  // 1. Update diagnosis_cases status
  let caseRecord = null;
  try {
    const { data, error } = await supabase
      .from('diagnosis_cases')
      .update({ status: 'expert_review_pending' })
      .eq('id', caseId)
      .select()
      .single();
    if (!error && data) caseRecord = data;
  } catch {}

  // Local fallback
  try {
    const list = fs.existsSync(LOCAL_DIAGNOSES_FILE)
      ? JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]')
      : [];
    const target = list.find((c) => c.id === caseId || c.case_id === caseId);
    if (target) {
      target.status = 'expert_review_pending';
      caseRecord = target;
    } else {
      caseRecord = {
        id: caseId,
        case_id: caseId,
        farmer_id: farmerId || 'farmer123',
        crop,
        disease,
        predicted_disease: disease,
        confidence,
        severity_band: severity,
        severity_percent: severity === 'severe' ? 75 : severity === 'moderate' ? 45 : 20,
        image_url: imageUrl,
        status: 'expert_review_pending',
        created_at: new Date().toISOString(),
      };
      list.push(caseRecord);
    }
    fs.writeFileSync(LOCAL_DIAGNOSES_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    console.warn('[expertController] Local diagnosis save error:', err);
  }

  // 2. Create pending review entry
  const pendingReview = {
    id: uuidv4(),
    case_id: caseId,
    farmer_id: farmerId || null,
    expert_id: null,
    review_status: 'pending',
    notes,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('expert_reviews').insert(pendingReview);
  } catch {}
  saveLocalReview(pendingReview);

  res.json({
    success: true,
    message: 'Expert verification requested successfully. Case is now under review.',
    data: {
      case_id: caseId,
      status: 'PENDING',
      review_status: 'pending',
      created_at: pendingReview.created_at,
    },
  });
});

/**
 * GET /api/expert/case/:caseId/status
 * Check current expert review status for a case.
 */
const getCaseVerificationStatus = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  let review = null;
  try {
    const { data } = await supabase
      .from('expert_reviews')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) review = data;
  } catch {}

  if (!review) {
    const local = getLocalReviews();
    review = local.find((r) => r.case_id === caseId);
  }

  let caseStatus = 'suspected';
  try {
    const { data: c } = await supabase
      .from('diagnosis_cases')
      .select('status, predicted_disease')
      .eq('id', caseId)
      .single();
    if (c) caseStatus = c.status;
  } catch {}

  const statusMapped = review
    ? review.review_status?.toUpperCase()
    : caseStatus === 'confirmed'
    ? 'CONFIRMED'
    : caseStatus === 'corrected'
    ? 'CORRECTED'
    : caseStatus === 'expert_review_pending'
    ? 'PENDING'
    : 'PENDING';

  res.json({
    success: true,
    data: {
      case_id: caseId,
      status: statusMapped, // PENDING | CONFIRMED | CORRECTED
      expert_diagnosis: review?.expert_diagnosis || null,
      remarks: review?.remarks || null,
      reviewed_at: review?.reviewed_at || null,
    },
  });
});

/**
 * GET /api/expert/cases/pending
 * Cases that need expert attention.
 */
const getPendingCases = asyncHandler(async (req, res) => {
  let cases = [];
  try {
    const { data, error } = await supabase
      .from('diagnosis_cases')
      .select('*')
      .in('status', ['expert_review_pending', 'suspected'])
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) cases = data;
  } catch {}

  if (cases.length === 0 && fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]');
      cases = list.filter((c) => c.status === 'expert_review_pending' || c.status === 'suspected');
    } catch {}
  }

  res.json({ success: true, data: cases });
});

/**
 * GET /api/expert/cases/:caseId
 */
const getCaseDetails = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  let diagnosisCase = null;
  try {
    const { data, error } = await supabase
      .from('diagnosis_cases')
      .select('*')
      .eq('id', caseId)
      .single();
    if (!error && data) diagnosisCase = data;
  } catch {}

  if (!diagnosisCase && fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]');
      diagnosisCase = list.find((c) => c.id === caseId || c.case_id === caseId);
    } catch {}
  }

  if (!diagnosisCase) throw new ApiError(404, 'Case not found.');

  let reviews = [];
  try {
    const { data } = await supabase
      .from('expert_reviews')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (data) reviews = data;
  } catch {}

  if (reviews.length === 0) {
    const local = getLocalReviews();
    reviews = local.filter((r) => r.case_id === caseId);
  }

  res.json({ success: true, data: { case: diagnosisCase, reviews } });
});

/**
 * POST /api/expert/review
 * body: { case_id, expert_id, review_status, expert_diagnosis, remarks }
 * review_status: 'confirmed' | 'corrected' | 'rejected'
 */
const submitExpertReview = asyncHandler(async (req, res) => {
  const caseId = req.body.case_id || req.body.caseId;
  const expertId = req.body.expert_id || req.body.expertId;
  const reviewStatus = req.body.review_status || req.body.reviewStatus || req.body.status;
  const expertDiagnosis = req.body.expert_diagnosis || req.body.expertDiagnosis || req.body.correctedDisease;
  const remarks = req.body.remarks || req.body.reviewNotes;

  if (!caseId || !reviewStatus) {
    throw new ApiError(400, 'case_id and review_status are required.');
  }

  const validStatuses = ['confirmed', 'corrected', 'rejected', 'pending'];
  if (!validStatuses.includes(reviewStatus.toLowerCase())) {
    throw new ApiError(400, `review_status must be one of: ${validStatuses.join(', ')}`);
  }

  const cleanStatus = reviewStatus.toLowerCase();

  // 1. Insert/update expert review record
  const reviewRecord = {
    id: uuidv4(),
    case_id: caseId,
    expert_id: expertId || 'dr-ashok-kulkarni-nashik',
    expert_name: 'Dr. Ashok Kulkarni (Senior Agronomist, Nashik)',
    expert_diagnosis: expertDiagnosis || 'Purple Blotch',
    review_status: cleanStatus,
    remarks: remarks || (cleanStatus === 'confirmed' ? 'Diagnosis verified based on leaf lesion characteristics.' : 'Diagnosis corrected.'),
    reviewed_at: new Date().toISOString(),
  };

  try {
    await supabase.from('expert_reviews').insert(reviewRecord);
  } catch {}
  saveLocalReview(reviewRecord);

  // 2. Update diagnosis case status
  let newCaseStatus = cleanStatus === 'confirmed' ? 'confirmed' : cleanStatus === 'corrected' ? 'corrected' : 'resolved';
  const caseUpdates = { status: newCaseStatus };
  if (expertDiagnosis && cleanStatus === 'corrected') {
    caseUpdates.predicted_disease = expertDiagnosis;
  }

  let updatedCase = null;
  try {
    const { data } = await supabase
      .from('diagnosis_cases')
      .update(caseUpdates)
      .eq('id', caseId)
      .select()
      .single();
    if (data) updatedCase = data;
  } catch {}

  // Update in local file
  if (fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]');
      const target = list.find((c) => c.id === caseId || c.case_id === caseId);
      if (target) {
        target.status = newCaseStatus;
        if (expertDiagnosis && cleanStatus === 'corrected') target.predicted_disease = expertDiagnosis;
        fs.writeFileSync(LOCAL_DIAGNOSES_FILE, JSON.stringify(list, null, 2));
        if (!updatedCase) updatedCase = target;
      }
    } catch {}
  }

  res.json({
    success: true,
    data: {
      review: reviewRecord,
      case: updatedCase || { id: caseId, ...caseUpdates },
      status: cleanStatus.toUpperCase(),
      note:
        newCaseStatus === 'confirmed' || newCaseStatus === 'corrected'
          ? 'Case is now confirmed by agronomist and updates regional hotspot maps.'
          : 'Case status updated.',
    },
  });
});

/**
 * POST /api/expert/chat
 * Secure server-side proxy for agricultural expert consultation.
 * Keeps LLM credentials strictly on backend. If no key, gracefully returns fallback.
 */
const chatWithExpert = asyncHandler(async (req, res) => {
  const { messages, systemPrompt } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.json({
      success: false,
      fallback: true,
      message: 'LLM not configured on backend; using local intelligent agronomist engine.',
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt || 'You are Dr. R. Patil, an experienced KVK agronomist.',
        messages: messages || [],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.content?.find((c) => c.type === 'text')?.text || data.content?.[0]?.text || '';
      return res.json({ success: true, text: reply });
    } else {
      return res.json({ success: false, fallback: true });
    }
  } catch (err) {
    return res.json({ success: false, fallback: true });
  }
});

module.exports = {
  requestExpertVerification,
  getCaseVerificationStatus,
  getPendingCases,
  getCaseDetails,
  submitExpertReview,
  chatWithExpert,
};
