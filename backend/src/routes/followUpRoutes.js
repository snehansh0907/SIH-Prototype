const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const {
  createFollowUp,
  uploadFollowUpPhoto,
  getFollowUpsByCase,
} = require('../controllers/followUpController');

// POST /api/follow-ups (Status click: better | same | worse)
router.post('/', createFollowUp);

// POST /api/follow-ups/photo (Multipart: image, case_id, farmer_id, crop)
router.post('/photo', upload.single('image'), uploadFollowUpPhoto);

// GET /api/follow-ups/:caseId
router.get('/:caseId', getFollowUpsByCase);

module.exports = router;
