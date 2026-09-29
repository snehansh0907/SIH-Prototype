const express = require('express');
const router = express.Router();

const {
  requestExpertVerification,
  getCaseVerificationStatus,
  getPendingCases,
  getCaseDetails,
  submitExpertReview,
  chatWithExpert,
} = require('../controllers/expertController');

// POST /api/expert/request (Farmer requests expert verification)
router.post('/request', requestExpertVerification);

// GET /api/expert/case/:caseId/status (Farmer checks status)
router.get('/case/:caseId/status', getCaseVerificationStatus);

// GET /api/expert/cases/pending (Expert views queue)
router.get('/cases/pending', getPendingCases);

// GET /api/expert/cases/:caseId (Expert views case details)
router.get('/cases/:caseId', getCaseDetails);

// POST /api/expert/review (Expert confirms or corrects diagnosis)
router.post('/review', submitExpertReview);

// POST /api/expert/chat (Server-side LLM proxy or fallback)
router.post('/chat', chatWithExpert);

module.exports = router;
