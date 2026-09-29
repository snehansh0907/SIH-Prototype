// =========================================================
// Follow-Up Controller
// =========================================================
// POST /api/follow-ups (Status click: better | same | worse)
// POST /api/follow-ups/photo (Photo upload + trend comparison)
// GET  /api/follow-ups/:caseId (List historical follow-ups)
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { diagnoseCropImage } = require('../services/diseaseDetectionService');

const LOCAL_FOLLOWUPS_FILE = path.resolve(__dirname, '../data/follow_ups.json');
const LOCAL_DIAGNOSES_FILE = path.resolve(__dirname, '../data/diagnosis_cases.json');

function saveLocalFollowUp(record) {
  try {
    let list = [];
    if (fs.existsSync(LOCAL_FOLLOWUPS_FILE)) {
      list = JSON.parse(fs.readFileSync(LOCAL_FOLLOWUPS_FILE, 'utf8') || '[]');
    }
    list.unshift(record);
    fs.writeFileSync(LOCAL_FOLLOWUPS_FILE, JSON.stringify(list, null, 2));
  } catch {}
}

function getLocalFollowUps(caseId) {
  try {
    if (fs.existsSync(LOCAL_FOLLOWUPS_FILE)) {
      const list = JSON.parse(fs.readFileSync(LOCAL_FOLLOWUPS_FILE, 'utf8') || '[]');
      return list.filter((f) => f.case_id === caseId);
    }
  } catch {}
  return [];
}

/**
 * Compares two severity levels to determine clinical crop trajectory.
 */
function compareSeverities(prevStr = 'moderate', currStr = 'moderate') {
  const rank = {
    minimal: 1,
    low: 2,
    moderate: 3,
    high: 4,
    severe: 5,
  };

  const p = rank[(prevStr || '').toLowerCase()] || 3;
  const c = rank[(currStr || '').toLowerCase()] || 3;

  if (c < p) {
    return {
      trend: 'improving',
      result: 'Improving',
      resultHi: 'सुधार हो रहा है',
      resultMr: 'सुधारणा होत आहे',
      recommendation: 'Crop health is improving. Continue preventative care and scheduled aeration.',
      recommendationHi: 'फसल के स्वास्थ्य में सुधार हो रहा है। निवारक उपाय जारी रखें।',
      recommendationMr: 'पिकाच्या आरोग्यात सुधारणा होत आहे. नियमित काळजी सुरू ठेवा.',
      followUpStatus: 'better',
    };
  } else if (c > p) {
    return {
      trend: 'worsening',
      result: 'Risk increasing — expert verification recommended.',
      resultHi: 'जोखिम बढ़ रहा है — विशेषज्ञ सत्यापन की सिफारिश की जाती है।',
      resultMr: 'धोका वाढत आहे — कृषी तज्ज्ञांच्या सल्ल्याची शिफारस केली जाते.',
      recommendation: 'Infection is expanding. Contact agronomist or upload to expert verification queue.',
      recommendationHi: 'संक्रमण फैल रहा है। कृषि विशेषज्ञ से संपर्क करें।',
      recommendationMr: 'रोगाचा प्रादुर्भाव वाढताना दिसत आहे. तातडीने कृषी तज्ज्ञांशी संपर्क साधा.',
      followUpStatus: 'worse',
    };
  } else {
    return {
      trend: 'stable',
      result: 'Stable / Controlled',
      resultHi: 'स्थिर / नियंत्रित',
      resultMr: 'स्थिर / नियंत्रणात',
      recommendation: 'Condition remains stable. Continue regular morning inspection.',
      recommendationHi: 'स्थिति स्थिर है। नियमित निगरानी जारी रखें।',
      recommendationMr: 'परिस्थिती स्थिर आहे. दैनंदिन निरीक्षण सुरू ठेवा.',
      followUpStatus: 'same',
    };
  }
}

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
    created_at: new Date().toISOString(),
  };

  let inserted = null;
  try {
    const { data, error } = await supabase.from('follow_ups').insert(newFollowUp).select().single();
    if (!error && data) inserted = data;
  } catch {}

  saveLocalFollowUp(newFollowUp);

  const recommendation =
    status === 'worse'
      ? 'Risk increasing — expert verification recommended.'
      : status === 'better'
      ? 'Crop recovery logged successfully.'
      : 'Continue regular field scouting.';

  // If worse, escalate case
  if (status === 'worse') {
    try {
      await supabase
        .from('diagnosis_cases')
        .update({ status: 'expert_review_pending' })
        .eq('id', caseId);
    } catch {}
  }

  res.status(201).json({
    success: true,
    data: { follow_up: inserted || newFollowUp, recommendation },
  });
});

/**
 * POST /api/follow-ups/photo
 * multipart/form-data: image, case_id, farmer_id, crop
 * Analyzes follow-up photo and compares with previous diagnosis.
 */
const uploadFollowUpPhoto = asyncHandler(async (req, res) => {
  const { case_id: caseId, farmer_id: farmerId, crop } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'A follow-up leaf photo is required.');
  }
  if (!caseId) {
    throw new ApiError(400, 'case_id is required to link follow-up.');
  }

  // 1. Fetch previous diagnosis case
  let previousCase = null;
  try {
    const { data } = await supabase
      .from('diagnosis_cases')
      .select('*, crop_cycle:crop_cycle_id ( crop_name )')
      .eq('id', caseId)
      .single();
    if (data) previousCase = data;
  } catch {}

  if (!previousCase && fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf8') || '[]');
      previousCase = list.find((c) => c.id === caseId || c.case_id === caseId);
    } catch {}
  }

  const previousSeverity = previousCase?.severity_band || previousCase?.severity || 'Moderate';
  const cropName = crop || previousCase?.crop_name || previousCase?.crop_cycle?.crop_name || 'Onion';

  const imageUrl = `/uploads/${req.file.filename}`;
  const localFilePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);

  // 2. Run AI Analysis on the new follow-up photo
  const currentAi = await diagnoseCropImage({
    cropName,
    imagePath: localFilePath,
    originalFilename: req.file.originalname,
  });

  const currentSeverity =
    currentAi.severity === 'high' || currentAi.severity === 'severe'
      ? 'High'
      : currentAi.severity === 'low'
      ? 'Mild'
      : 'Moderate';

  // 3. Compare Previous vs Current Severity to establish Trend
  const comparison = compareSeverities(previousSeverity, currentSeverity);

  // 4. Record follow-up entry
  const followUpRecord = {
    id: uuidv4(),
    case_id: caseId,
    farmer_id: farmerId || null,
    status: comparison.followUpStatus,
    notes: `AI Follow-up Comparison: Previous was ${previousSeverity}, Current is ${currentSeverity}. Trend: ${comparison.result}`,
    new_image_url: imageUrl,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('follow_ups').insert(followUpRecord);
  } catch {}
  saveLocalFollowUp(followUpRecord);

  // 5. If getting worse, escalate case status to expert review
  if (comparison.trend === 'worsening') {
    try {
      await supabase
        .from('diagnosis_cases')
        .update({ status: 'expert_review_pending' })
        .eq('id', caseId);
    } catch {}
  }

  res.status(201).json({
    success: true,
    data: {
      case_id: caseId,
      previous_severity: previousSeverity,
      current_severity: currentSeverity,
      trend: comparison.trend,
      result: comparison.result,
      result_hi: comparison.resultHi,
      result_mr: comparison.resultMr,
      recommendation: comparison.recommendation,
      recommendation_hi: comparison.recommendationHi,
      recommendation_mr: comparison.recommendationMr,
      image_url: imageUrl,
      follow_up: followUpRecord,
    },
  });
});

/**
 * GET /api/follow-ups/:caseId
 */
const getFollowUpsByCase = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  let cases = [];
  try {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (!error && data) cases = data;
  } catch {}

  if (cases.length === 0) {
    cases = getLocalFollowUps(caseId);
  }

  res.json({ success: true, data: cases });
});

module.exports = {
  createFollowUp,
  uploadFollowUpPhoto,
  getFollowUpsByCase,
};
