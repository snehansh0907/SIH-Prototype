const express = require('express');
const router = express.Router();
const triageService = require('../services/triageService');

// GET /api/outbreaks (list all suspected and active outbreaks)
router.get('/', (req, res) => {
  const outbreaks = triageService.getAllOutbreaks();
  res.json({
    success: true,
    data: outbreaks,
    count: outbreaks.length,
  });
});

// GET /api/outbreaks/:id
router.get('/:id', (req, res) => {
  const outbreaks = triageService.getAllOutbreaks();
  const found = outbreaks.find((o) => o.id === req.params.id);
  if (!found) {
    return res.status(404).json({ success: false, message: 'Outbreak record not found.' });
  }
  res.json({ success: true, data: found });
});

// PATCH /api/outbreaks/:id/status
router.patch('/:id/status', (req, res) => {
  const { status, containment_advisory } = req.body;
  const outbreaks = triageService.getStoredOutbreaks();
  const target = outbreaks.find((o) => o.id === req.params.id);

  if (!target) {
    return res.status(404).json({ success: false, message: 'Outbreak record not found.' });
  }

  if (status) target.status = status;
  if (containment_advisory) target.containment_advisory = containment_advisory;
  target.updated_at = new Date().toISOString();

  triageService.saveStoredOutbreaks(outbreaks);

  res.json({
    success: true,
    data: target,
    message: `Outbreak status updated to "${status || target.status}".`,
  });
});

module.exports = router;
