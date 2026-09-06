// =========================================================
// Hotspot Controller
// =========================================================
// GET /api/hotspots?disease=&crop=&taluka=
// Returns confirmed and suspected cases separately for the
// frontend's Leaflet heatmap. No private farmer data included.
// =========================================================

const { asyncHandler } = require('../middleware/errorHandler');
const { getHotspots } = require('../services/hotspotService');

const getAllHotspots = asyncHandler(async (req, res) => {
  const { disease, crop, taluka } = req.query;

  const { confirmed, suspected } = await getHotspots({ disease, crop, taluka });

  res.json({
    success: true,
    data: {
      confirmed_cases: confirmed,
      suspected_cases: suspected,
      total: confirmed.length + suspected.length,
    },
  });
});

module.exports = { getAllHotspots };
