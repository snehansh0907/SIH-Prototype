const express = require('express');
const router = express.Router();

const { createFollowUp, getFollowUpsByCase } = require('../controllers/followUpController');

// POST /api/follow-ups
router.post('/', createFollowUp);

// GET /api/follow-ups/:caseId
router.get('/:caseId', getFollowUpsByCase);

module.exports = router;
