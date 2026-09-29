// =========================================================
// Risk Service
// =========================================================
// Integrates live weather, nearby disease hotspot cases,
// farm crop stage, and disease pathogen profile via the
// unified risk engine (riskEngine.js).
// =========================================================

const { getWeather } = require('./weatherService');
const { findNearbyCases, DEFAULT_RADIUS_KM } = require('./hotspotService');
const { calculateCropRisk, calculate5DayRiskForecast, getRiskLevel } = require('./riskEngine');

/**
 * Calculate a full risk forecast for a farm + active crop cycle.
 * @param {object} farm - { id, latitude, longitude, taluka, district }
 * @param {object} cropCycle - { id, crop_name, variety, crop_stage }
 * @param {object} [options] - optional overrides (e.g. specific disease, confidence)
 */
async function calculateRisk(farm, cropCycle, options = {}) {
  const weather = await getWeather(farm.latitude, farm.longitude);
  const nearbyCases = await findNearbyCases(farm.latitude, farm.longitude, DEFAULT_RADIUS_KM, farm.id);

  const crop = (options.crop || cropCycle?.crop_name || 'Onion').toLowerCase().trim();
  const disease = options.disease || (crop === 'onion' ? 'purple_blotch' : crop === 'tomato' ? 'early_blight' : 'rust');
  const cropStage = cropCycle?.crop_stage || options.cropStage || 'vegetative';
  const confidence = options.confidence ?? 0.91;

  const currentTemp = weather.current.temperature_c ?? 25;
  const currentHumidity = weather.current.humidity_percent ?? 78;
  const currentRainfall = weather.current.rainfall_mm ?? 0;
  const currentRainProb = weather.forecast?.[0]?.rain_probability_percent ?? 60;

  // Run unified risk engine
  const riskResult = calculateCropRisk({
    crop,
    disease,
    confidence,
    temperature: currentTemp,
    humidity: currentHumidity,
    rainfallMm: currentRainfall,
    rainProbability: currentRainProb,
    cropStage,
    nearbyCases,
    location: {
      latitude: farm.latitude,
      longitude: farm.longitude,
      taluka: farm.taluka,
      district: farm.district,
    },
  });

  // Calculate 5-day risk forecast
  const fiveDayForecast = calculate5DayRiskForecast(
    {
      crop,
      disease,
      confidence,
      temperature: currentTemp,
      humidity: currentHumidity,
      rainfallMm: currentRainfall,
      rainProbability: currentRainProb,
      cropStage,
      nearbyCases,
    },
    weather.forecast
  );

  return {
    risk_score: riskResult.score,
    risk_level: riskResult.level,
    score: riskResult.score, // alias for standard format
    level: riskResult.level, // alias for standard format
    humidity_factor: riskResult.factors.humidity_factor,
    rain_factor: riskResult.factors.rain_factor,
    temperature_factor: riskResult.factors.temperature_factor,
    crop_stage_factor: riskResult.factors.crop_stage_factor,
    nearby_cases_factor: riskResult.factors.nearby_cases_factor,
    factors: riskResult.factors,
    breakdown: riskResult.breakdown,
    reasons: riskResult.reasons,
    explanation: riskResult.reasons, // backward compatibility
    nearby_cases_count: nearbyCases.length,
    five_day_forecast: fiveDayForecast,
    weather_summary: {
      temp: currentTemp,
      humidity: currentHumidity,
      rainfallMm: currentRainfall,
      rainProbability: currentRainProb,
    },
  };
}

module.exports = { calculateRisk, getRiskLevel };
