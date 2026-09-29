// =========================================================
// Krishi Sarthak - Location Routes
// =========================================================

const express = require('express');
const router = express.Router();
const { reverseGeocode } = require('../services/locationService');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

// GET /api/location/reverse?lat=19.9975&lng=73.7898
router.get(
  '/reverse',
  asyncHandler(async (req, res) => {
    const { lat, lng, latitude, longitude } = req.query;
    const finalLat = parseFloat(lat || latitude);
    const finalLng = parseFloat(lng || longitude);

    if (isNaN(finalLat) || isNaN(finalLng)) {
      throw new ApiError(400, 'Valid "lat" and "lng" query parameters are required.');
    }

    const locationData = await reverseGeocode(finalLat, finalLng);
    res.json({
      success: true,
      data: locationData,
    });
  })
);

module.exports = router;
