// =========================================================
// Risk Service
// =========================================================
// Simple, transparent, rule-based risk model.
//
//   riskScore = humidityFactor + rainFactor + cropStageFactor + nearbyCasesFactor
//
// Each factor is capped so the total score always stays within 0-100.
//   humidityFactor      : 0 - 25
//   rainFactor          : 0 - 25
//   cropStageFactor     : 0 - 20
//   nearbyCasesFactor   : 0 - 30
//
// Risk levels:
//   0-30   -> LOW
//   31-60  -> MODERATE
//   61-100 -> HIGH
// =========================================================

const { getWeather } = require('./weatherService');
const { findNearbyCases, DEFAULT_RADIUS_KM } = require('./hotspotService');

const STAGE_RISK_WEIGHT = {
  sowing: 0.3,
  seedling: 0.5,
  vegetative: 0.7,
  flowering: 1.0, // most vulnerable stage
  fruiting: 0.9,
  maturity: 0.4,
  harvested: 0.1,
};

function calculateHumidityFactor(humidityPercent) {
  if (humidityPercent === null || humidityPercent === undefined) return 0;
  // Higher humidity => higher fungal/bacterial disease risk
  const factor = (humidityPercent / 100) * 25;
  return Math.round(Math.min(factor, 25));
}

function calculateRainFactor(rainfallMm, rainProbabilityPercent) {
  if (rainfallMm === null && rainProbabilityPercent === null) return 0;
  const rainAmountScore = Math.min((rainfallMm || 0) / 20, 1) * 15; // up to 15 pts for heavy rain
  const rainProbScore = Math.min((rainProbabilityPercent || 0) / 100, 1) * 10; // up to 10 pts for high probability
  return Math.round(Math.min(rainAmountScore + rainProbScore, 25));
}

function calculateCropStageFactor(cropStage) {
  const weight = STAGE_RISK_WEIGHT[cropStage] ?? 0.5;
  return Math.round(weight * 20);
}

function calculateNearbyCasesFactor(nearbyCases) {
  if (!nearbyCases || nearbyCases.length === 0) return 0;
  // Recent confirmed cases count for more than older ones
  let score = 0;
  nearbyCases.forEach((c) => {
    if (c.is_recent) {
      score += c.distance_km <= 3 ? 8 : c.distance_km <= 6 ? 5 : 3;
    } else {
      score += 1;
    }
  });
  return Math.round(Math.min(score, 30));
}

function getRiskLevel(score) {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MODERATE';
  return 'HIGH';
}

function buildExplanation({ humidityFactor, rainFactor, cropStageFactor, nearbyCasesFactor: _nearbyCasesFactor, nearbyCases, current, forecast, cropStage }) {
  const explanation = [];
  const rainProb = forecast?.[0]?.rain_probability_percent ?? 0;

  if (humidityFactor >= 18) {
    explanation.push(`High relative humidity (${current.humidity_percent ?? 'N/A'}%) increases fungal disease risk`);
  } else if (humidityFactor >= 10) {
    explanation.push(`Moderate humidity levels (${current.humidity_percent ?? 'N/A'}%) maintain disease risk`);
  } else {
    explanation.push(`Low humidity (${current.humidity_percent ?? 'N/A'}%) helps suppress disease development`);
  }

  if (rainFactor >= 15) {
    explanation.push(`Significant rainfall predicted (${rainProb}% chance) increases disease risk through spore splash`);
  } else if (rainFactor >= 8) {
    explanation.push(`Upcoming rain showers (${rainProb}% probability) may increase foliar disease risk`);
  } else {
    explanation.push('Dry weather conditions expected with minimal rain-driven risk');
  }

  if (cropStageFactor >= 14) {
    explanation.push(`Crop is in a highly vulnerable stage (${cropStage})`);
  } else if (cropStageFactor >= 8) {
    explanation.push(`Crop stage (${cropStage}) carries moderate disease susceptibility`);
  }

  const recentNearby = nearbyCases.filter((c) => c.is_recent);
  if (recentNearby.length > 0) {
    explanation.push(
      `${recentNearby.length} confirmed disease case(s) nearby in the last 14 days`
    );
  }

  if (explanation.length === 0) {
    explanation.push('Conditions are currently favourable with low disease pressure');
  }

  return explanation;
}

/**
 * Calculate a full risk forecast for a farm + active crop cycle.
 * @param {object} farm - { id, latitude, longitude }
 * @param {object} cropCycle - { id, crop_stage }
 */
async function calculateRisk(farm, cropCycle) {
  const weather = await getWeather(farm.latitude, farm.longitude);
  const nearbyCases = await findNearbyCases(farm.latitude, farm.longitude, DEFAULT_RADIUS_KM, farm.id);

  const cropStage = cropCycle?.crop_stage || 'vegetative';

  const humidityFactor = calculateHumidityFactor(weather.current.humidity_percent);
  const rainFactor = calculateRainFactor(
    Math.max(weather.current.rainfall_mm || 0, weather.forecast?.[0]?.rainfall_mm || 0),
    weather.forecast?.[0]?.rain_probability_percent
  );
  const cropStageFactor = calculateCropStageFactor(cropStage);
  const nearbyCasesFactor = calculateNearbyCasesFactor(nearbyCases);

  const riskScore = Math.min(
    Math.round(humidityFactor + rainFactor + cropStageFactor + nearbyCasesFactor),
    100
  );
  const riskLevel = getRiskLevel(riskScore);

  const explanation = buildExplanation({
    humidityFactor,
    rainFactor,
    cropStageFactor,
    nearbyCasesFactor,
    nearbyCases,
    current: weather.current,
    forecast: weather.forecast,
    cropStage,
  });

  // Simple 5-day forecast: apply the same model to each day's projected weather
  const fiveDayForecast = weather.forecast.map((day) => {
    const dHumidity = calculateHumidityFactor(day.humidity_percent);
    const dRain = calculateRainFactor(day.rainfall_mm, day.rain_probability_percent);
    const dScore = Math.min(Math.round(dHumidity + dRain + cropStageFactor + nearbyCasesFactor), 100);
    return {
      date: day.date,
      risk_score: dScore,
      risk_level: getRiskLevel(dScore),
      max_temp_c: day.max_temp_c,
      min_temp_c: day.min_temp_c,
      rainfall_mm: day.rainfall_mm,
      humidity_percent: day.humidity_percent,
    };
  });

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    humidity_factor: humidityFactor,
    rain_factor: rainFactor,
    crop_stage_factor: cropStageFactor,
    nearby_cases_factor: nearbyCasesFactor,
    explanation,
    nearby_cases_count: nearbyCases.length,
    five_day_forecast: fiveDayForecast,
  };
}

module.exports = { calculateRisk, getRiskLevel };
