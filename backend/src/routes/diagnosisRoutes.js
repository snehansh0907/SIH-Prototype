const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { createDiagnosis, getDiagnosisById } = require('../controllers/diagnosisController');

// POST /api/diagnosis  (multipart/form-data: image, farmer_id, farm_id, crop_cycle_id)
router.post('/', upload.single('image'), createDiagnosis);

// GET /api/diagnosis/:caseId
router.get('/:caseId', getDiagnosisById);

module.exports = router;
