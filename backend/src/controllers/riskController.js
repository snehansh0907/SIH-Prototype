// =========================================================
// Risk Controller
// =========================================================
// GET /api/risk/:farmId
//   1. Get farm location
//   2. Get active crop cycle
//   3. Fetch weather data
//   4. Find nearby confirmed disease cases
//   5. Calculate risk (via riskService)
// =========================================================

const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { calculateRisk } = require('../services/riskService');

/**
 * GET /api/risk/:farmId
 */
const getRiskForFarm = asyncHandler(async (req, res) => {
  const { farmId } = req.params;

  // 1. Get farm location
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('id, latitude, longitude, farm_name, taluka, district')
    .eq('id', farmId)
    .single();

  if (farmError || !farm) {
    throw new ApiError(404, 'Farm not found.');
  }

  // 2. Get active crop cycle for this farm (most recently created active one)
  const { data: cropCycles } = await supabase
    .from('crop_cycles')
    .select('*')
    .eq('farm_id', farmId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  const activeCropCycle = cropCycles && cropCycles.length > 0 ? cropCycles[0] : null;

  // 3 + 4 + 5: weather, nearby cases, risk calculation (all handled in riskService)
  const risk = await calculateRisk(farm, activeCropCycle);

  // Persist this forecast so it can be reviewed/audited later
  const forecastRecord = {
    id: uuidv4(),
    farm_id: farm.id,
    crop_cycle_id: activeCropCycle?.id || null,
    forecast_date: new Date().toISOString().slice(0, 10),
    risk_score: risk.risk_score,
    risk_level: risk.risk_level,
    humidity_factor: risk.humidity_factor,
    rain_factor: risk.rain_factor,
    crop_stage_factor: risk.crop_stage_factor,
    nearby_cases_factor: risk.nearby_cases_factor,
    explanation: risk.explanation,
  };

  const { error: insertError } = await supabase.from('risk_forecasts').insert(forecastRecord);
  if (insertError) {
    // Don't fail the whole request if logging the forecast fails - just warn.
    console.warn('[Risk] Failed to store risk forecast:', insertError.message);
  }

  res.json({
    success: true,
    data: {
      farm_id: farm.id,
      farm_name: farm.farm_name,
      crop_cycle: activeCropCycle
        ? { id: activeCropCycle.id, crop_name: activeCropCycle.crop_name, crop_stage: activeCropCycle.crop_stage }
        : null,
      risk_score: risk.risk_score,
      risk_level: risk.risk_level,
      explanation: risk.explanation,
      factors: {
        humidity_factor: risk.humidity_factor,
        rain_factor: risk.rain_factor,
        crop_stage_factor: risk.crop_stage_factor,
        nearby_cases_factor: risk.nearby_cases_factor,
      },
      nearby_confirmed_cases: risk.nearby_cases_count,
      five_day_forecast: risk.five_day_forecast,
    },
  });
});

module.exports = { getRiskForFarm };
