// =========================================================
// Pashu Sarthak - Livestock Risk Service
// =========================================================
// Integrates live weather (Open-Meteo), nearby livestock disease
// outbreak clusters (hotspotService), and herd bioclimatic factors
// (THI heat stress + vector proliferation) via riskEngine.js.
// =========================================================

const { getWeather } = require('./weatherService');
const { findNearbyCases, DEFAULT_RADIUS_KM } = require('./hotspotService');
const { calculateLivestockRisk, calculate5DayRiskForecast, getRiskLevel, computeTHI } = require('./riskEngine');

/**
 * Calculate a full livestock risk forecast for a herd / shed.
 * @param {object} herdOrFarm - { id, latitude, longitude, taluka, district, shed_name }
 * @param {object} animalUnit - { id, species, breed, production_stage, animal_tag }
 * @param {object} [options] - optional overrides (e.g. disease, confidence)
 */
async function calculateRisk(herdOrFarm, animalUnit, options = {}) {
  const weather = await getWeather(herdOrFarm.latitude, herdOrFarm.longitude);
  const nearbyCases = await findNearbyCases(herdOrFarm.latitude, herdOrFarm.longitude, DEFAULT_RADIUS_KM, herdOrFarm.id);

  const species = (options.species || options.crop || animalUnit?.species || herdOrFarm?.primary_species || 'Cattle').toLowerCase().trim();
  const disease = options.disease || (species.includes('buffalo') || species.includes('cattle') ? 'lumpy_skin_disease' : 'foot_and_mouth_disease');
  const cropStage = animalUnit?.production_stage || options.cropStage || 'crossbred_lactating';
  const confidence = options.confidence ?? 0.91;

  const currentTemp = weather.current.temperature_c ?? 28;
  const currentHumidity = weather.current.humidity_percent ?? 78;
  const currentRainfall = weather.current.rainfall_mm ?? 0;
  const currentRainProb = weather.forecast?.[0]?.rain_probability_percent ?? 55;

  // Run unified livestock risk engine
  const riskResult = calculateLivestockRisk({
    crop: species,
    species,
    disease,
    confidence,
    temperature: currentTemp,
    humidity: currentHumidity,
    rainfallMm: currentRainfall,
    rainProbability: currentRainProb,
    cropStage,
    nearbyCases,
    location: {
      latitude: herdOrFarm.latitude,
      longitude: herdOrFarm.longitude,
      taluka: herdOrFarm.taluka,
      district: herdOrFarm.district,
    },
  });

  // Calculate 5-day risk trajectory
  const fiveDayForecast = calculate5DayRiskForecast(
    {
      crop: species,
      species,
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
    score: riskResult.score,
    level: riskResult.level,
    thi: riskResult.thi,
    thi_status: riskResult.thiStatus,
    vector_factor: riskResult.factors.vector_factor,
    fmd_factor: riskResult.factors.fmd_factor,
    thi_factor: riskResult.factors.thi_factor,
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
      thi: riskResult.thi,
    },
  };
}

module.exports = { calculateRisk, getRiskLevel, computeTHI };
