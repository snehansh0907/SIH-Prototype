const express = require('express');
const router = express.Router();

const { getRiskForFarm, getRiskForecast } = require('../controllers/riskController');

// GET /api/risk/forecast?crop=onion&lat=20.085&lng=74.11
router.get('/forecast', getRiskForecast);
router.get('/', getRiskForecast);

// GET /api/risk/:farmId
router.get('/:farmId', getRiskForFarm);

module.exports = router;
