const express = require('express');
const router = express.Router();

const { getAllHotspots } = require('../controllers/hotspotController');

// GET /api/hotspots?disease=&crop=&taluka=
router.get('/', getAllHotspots);

module.exports = router;
