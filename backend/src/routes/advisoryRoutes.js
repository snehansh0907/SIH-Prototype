const express = require('express');
const router = express.Router();

const { getAdvisoryForCase } = require('../controllers/advisoryController');

// GET /api/advisory/:caseId
router.get('/:caseId', getAdvisoryForCase);

module.exports = router;
