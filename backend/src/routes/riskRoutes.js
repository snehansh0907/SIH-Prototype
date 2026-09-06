const express = require('express');
const router = express.Router();

const { getRiskForFarm } = require('../controllers/riskController');

// GET /api/risk/:farmId
router.get('/:farmId', getRiskForFarm);

module.exports = router;
