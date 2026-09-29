// =========================================================
// Hotspot Controller
// =========================================================
// GET /api/hotspots?disease=&crop=&taluka=&lat=&lng=&radius=
// Returns anonymized disease report cluster for local area radar.
// Private farmer information is NEVER exposed.
// =========================================================

const { asyncHandler } = require('../middleware/errorHandler');
const { getHotspots } = require('../services/hotspotService');

const getAllHotspots = asyncHandler(async (req, res) => {
  const { disease, crop, taluka, lat, lng, radius } = req.query;

  const result = await getHotspots({
    disease,
    crop,
    taluka,
    latitude: lat ? parseFloat(lat) : undefined,
    longitude: lng ? parseFloat(lng) : undefined,
    radiusKm: radius ? parseFloat(radius) : undefined,
  });

  res.json({
    success: true,
    data: result,
  });
});

module.exports = { getAllHotspots };
