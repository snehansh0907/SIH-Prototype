const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const {
  createDiagnosis,
  getDiagnosisById,
  getAllDiagnosisCases,
  updateCaseStatus,
  getLatestDiagnosisByFarm,
  getLatestDiagnosisByFarmer,
  getMLHealth,
} = require('../controllers/diagnosisController');

// GET /api/diagnosis/ml/health
router.get('/ml/health', getMLHealth);
router.get('/health', getMLHealth);

// GET /api/diagnosis (Regional case listing for Veterinary Officials)
router.get('/', getAllDiagnosisCases);
router.get('/cases', getAllDiagnosisCases);

// POST /api/diagnosis  (multipart/form-data: image, farmer_id, farm_id, crop_cycle_id)
router.post('/', upload.single('image'), createDiagnosis);

// GET /api/diagnosis/farm/:farmId/latest (or /farm/:farmId)
router.get('/farm/:farmId/latest', getLatestDiagnosisByFarm);
router.get('/farm/:farmId', getLatestDiagnosisByFarm);

// GET /api/diagnosis/farmer/:farmerId/latest (or /farmer/:farmerId)
router.get('/farmer/:farmerId/latest', getLatestDiagnosisByFarmer);
router.get('/farmer/:farmerId', getLatestDiagnosisByFarmer);

// PATCH /api/diagnosis/:caseId/status (Veterinary Official Case Status Workflow)
router.patch('/:caseId/status', updateCaseStatus);
router.put('/:caseId/status', updateCaseStatus);

// GET /api/diagnosis/:caseId
router.get('/:caseId', getDiagnosisById);

module.exports = router;

