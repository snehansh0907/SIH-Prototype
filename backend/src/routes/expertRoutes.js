const express = require('express');
const router = express.Router();

const { getPendingCases, getCaseDetails, submitExpertReview } = require('../controllers/expertController');

// GET /api/expert/cases/pending
router.get('/cases/pending', getPendingCases);

// GET /api/expert/cases/:caseId
router.get('/cases/:caseId', getCaseDetails);

// POST /api/expert/review
router.post('/review', submitExpertReview);

module.exports = router;
