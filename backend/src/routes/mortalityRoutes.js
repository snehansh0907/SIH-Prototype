const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const {
  createMortalityReport,
  getAllMortalityReports,
  getMortalityReportById,
} = require('../controllers/mortalityController');

// POST /api/mortality (with optional photo upload)
router.post('/', upload.single('photo'), createMortalityReport);

// GET /api/mortality (list with filters)
router.get('/', getAllMortalityReports);

// GET /api/mortality/:id
router.get('/:id', getMortalityReportById);

module.exports = router;
