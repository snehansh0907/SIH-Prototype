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

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { calculateRisk } = require('../services/riskService');

const REGISTERED_USERS_FILE = path.resolve(__dirname, '../data/registered_users.json');

function readLocalUsers() {
  try {
    if (!fs.existsSync(REGISTERED_USERS_FILE)) return [];
    const data = fs.readFileSync(REGISTERED_USERS_FILE, 'utf8');
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * GET /api/risk/:farmId
 */
const getRiskForFarm = asyncHandler(async (req, res) => {
  const { farmId } = req.params;

  // 1. Get farm location
  let farm = null;
  try {
    const { data: supaFarm, error: farmError } = await supabase
      .from('farms')
      .select('id, latitude, longitude, farm_name, taluka, district')
      .eq('id', farmId)
      .single();
    if (!farmError && supaFarm) farm = supaFarm;
  } catch {}

  let matchedLocalUser = null;
  if (!farm) {
    const localUsers = readLocalUsers();
    matchedLocalUser = localUsers.find((u) => u.farmId === farmId || `farm-${u.id}` === farmId || u.id === farmId);
    if (matchedLocalUser) {
      farm = {
        id: matchedLocalUser.farmId || `farm-${matchedLocalUser.id}`,
        farm_name: matchedLocalUser.farmName || `${matchedLocalUser.name.split(' ')[0]}'s Farm`,
        latitude: matchedLocalUser.latitude ?? 20.085,
        longitude: matchedLocalUser.longitude ?? 74.11,
        taluka: matchedLocalUser.taluka || '',
        district: matchedLocalUser.district || '',
      };
    }
  }

  if (!farm) {
    throw new ApiError(404, 'Farm not found.');
  }

  // 2. Get active crop cycle for this farm (most recently created active one)
  let activeCropCycle = null;
  try {
    const { data: cropCycles } = await supabase
      .from('crop_cycles')
      .select('*')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    if (cropCycles && cropCycles.length > 0) activeCropCycle = cropCycles[0];
  } catch {}

  if (!activeCropCycle && matchedLocalUser && matchedLocalUser.monitoredCrop) {
    activeCropCycle = {
      id: matchedLocalUser.cropCycleId || `cycle-${matchedLocalUser.id}`,
      crop_name: matchedLocalUser.monitoredCrop,
      variety: 'Selected',
      crop_stage: 'vegetative',
      status: 'active',
    };
  }

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
