// =========================================================
// Krishi Sarthak - Agronomic Crop Disease Risk Engine
// =========================================================
// Combines:
//   - Crop species & stage susceptibility
//   - Diagnosed disease / pest pathogen biology
//   - AI detection confidence
//   - Real-time & forecast weather (temperature, humidity, rainfall)
//   - Spatial disease cluster pressure (nearby confirmed reports)
//
// NOTE FOR AGRONOMISTS:
// The thresholds below are transparent prototype heuristics designed
// for the SIH Maharashtra scenario (e.g. Onion Purple Blotch, Tomato
// Early Blight, Soybean Rust). They are modularized so validated ICAR /
// MPKV Rahuri agronomic epidemiological models can replace them cleanly.
// =========================================================

/**
 * Vulnerability weights for crop phenological stages.
 * Flowering and bulb formation / fruiting create dense canopies and high nutrient demand.
 */
const CROP_STAGE_VULNERABILITY = {
  sowing: { weight: 0.3, label: 'Sowing / Germination', susceptibility: 'Low' },
  seedling: { weight: 0.5, label: 'Seedling Stage', susceptibility: 'Moderate' },
  vegetative: { weight: 0.7, label: 'Vegetative Growth', susceptibility: 'Moderate' },
  flowering: { weight: 1.0, label: 'Flowering Stage', susceptibility: 'Susceptible' },
  fruiting: { weight: 0.95, label: 'Bulb / Fruit Formation', susceptibility: 'Susceptible' },
  maturity: { weight: 0.4, label: 'Maturity / Ripening', susceptibility: 'Low' },
  harvested: { weight: 0.1, label: 'Harvested', susceptibility: 'Minimal' },
};

/**
 * Pathogen weather preferences (temperature windows and humidity thresholds).
 */
const PATHOGEN_PROFILES = {
  purple_blotch: {
    name: 'Purple Blotch (Alternaria porri)',
    optimalTempMin: 21,
    optimalTempMax: 30,
    criticalHumidity: 80,
    rainDriven: true,
  },
  early_blight: {
    name: 'Early Blight (Alternaria solani)',
    optimalTempMin: 22,
    optimalTempMax: 30,
    criticalHumidity: 75,
    rainDriven: true,
  },
  late_blight: {
    name: 'Late Blight (Phytophthora infestans)',
    optimalTempMin: 12,
    optimalTempMax: 22,
    criticalHumidity: 85,
    rainDriven: true,
  },
  rust: {
    name: 'Foliar Rust',
    optimalTempMin: 18,
    optimalTempMax: 28,
    criticalHumidity: 80,
    rainDriven: true,
  },
  leaf_curl: {
    name: 'Leaf Curl Virus',
    optimalTempMin: 25,
    optimalTempMax: 35,
    criticalHumidity: 60,
    rainDriven: false, // insect vector (whitefly) driven
  },
  default: {
    name: 'General Foliar Disease',
    optimalTempMin: 20,
    optimalTempMax: 32,
    criticalHumidity: 75,
    rainDriven: true,
  },
};

function getPathogenProfile(diseaseName = '') {
  const d = diseaseName.toLowerCase().replace(/[\s-]+/g, '_');
  for (const [key, profile] of Object.entries(PATHOGEN_PROFILES)) {
    if (d.includes(key)) return profile;
  }
  return PATHOGEN_PROFILES.default;
}

/**
 * Calculates humidity score (0 - 25 points).
 * Prolonged relative humidity above 75-80% enables fungal spore germination.
 */
function computeHumidityFactor(humidityPercent, criticalThreshold = 75) {
  if (humidityPercent === null || humidityPercent === undefined || isNaN(humidityPercent)) {
    return { score: 12, status: 'Moderate', value: 65 };
  }
  const hum = Math.max(0, Math.min(100, Number(humidityPercent)));
  let score = 0;
  let status = 'Low';

  if (hum >= criticalThreshold) {
    // 18 - 25 points for high humidity
    score = 18 + Math.round(((hum - criticalThreshold) / (100 - criticalThreshold)) * 7);
    status = 'High';
  } else if (hum >= 60) {
    // 10 - 17 points for moderate humidity
    score = 10 + Math.round(((hum - 60) / (criticalThreshold - 60)) * 7);
    status = 'Moderate';
  } else {
    // 0 - 9 points for dry conditions
    score = Math.round((hum / 60) * 9);
    status = 'Low';
  }

  return { score: Math.min(score, 25), status, value: Math.round(hum) };
}

/**
 * Calculates rainfall score (0 - 25 points).
 * Rain splashes spores from soil and infected leaves onto fresh canopy.
 */
function computeRainFactor(rainfallMm = 0, rainProbPercent = 0, rainDriven = true) {
  const mm = Math.max(0, Number(rainfallMm) || 0);
  const prob = Math.max(0, Math.min(100, Number(rainProbPercent) || 0));

  if (!rainDriven) {
    // For vector-driven pests (e.g. whitefly), heavy rain actually washes vectors away
    const dryBonus = prob < 30 ? 15 : 5;
    return { score: dryBonus, status: prob < 30 ? 'Dry (Favorable for vector)' : 'Rainy (Suppresses vector)', rainfallMm: mm, rainProbability: prob };
  }

  // Amount score up to 15 points
  const amountScore = Math.min(mm / 15, 1) * 15;
  // Probability score up to 10 points
  const probScore = (prob / 100) * 10;

  const totalScore = Math.round(Math.min(amountScore + probScore, 25));
  let status = 'Low';
  if (totalScore >= 16 || prob >= 60 || mm >= 10) status = 'High';
  else if (totalScore >= 8 || prob >= 30 || mm >= 2) status = 'Moderate';

  return { score: totalScore, status, rainfallMm: mm, rainProbability: prob };
}

/**
 * Calculates temperature suitability factor (0 - 15 points).
 */
function computeTemperatureFactor(tempC, profile) {
  if (tempC === null || tempC === undefined || isNaN(tempC)) {
    return { score: 8, status: 'Suitable', value: 25 };
  }
  const temp = Number(tempC);
  let score = 5;
  let status = 'Moderate';

  if (temp >= profile.optimalTempMin && temp <= profile.optimalTempMax) {
    score = 15; // Optimal temperature for disease spread
    status = 'Suitable';
  } else if (temp >= profile.optimalTempMin - 4 && temp <= profile.optimalTempMax + 4) {
    score = 9;
    status = 'Moderate';
  } else {
    score = 3;
    status = 'Unfavorable';
  }

  return { score, status, value: Math.round(temp) };
}

/**
 * Calculates crop stage vulnerability score (0 - 15 points).
 */
function computeCropStageFactor(cropStage = 'vegetative') {
  const key = String(cropStage).toLowerCase().trim();
  const stageInfo = CROP_STAGE_VULNERABILITY[key] || CROP_STAGE_VULNERABILITY.vegetative;
  const score = Math.round(stageInfo.weight * 15);
  return { score, stage: stageInfo.label, susceptibility: stageInfo.susceptibility };
}

/**
 * Calculates nearby disease pressure score (0 - 20 points).
 */
function computeNearbyCasesFactor(nearbyCases = []) {
  const cases = Array.isArray(nearbyCases) ? nearbyCases : [];
  if (cases.length === 0) {
    return { score: 0, count: 0, status: 'No nearby reports', closestKm: null };
  }

  let score = 0;
  let closestKm = Infinity;

  cases.forEach((c) => {
    const dist = typeof c.distance_km === 'number' ? c.distance_km : typeof c.distanceKm === 'number' ? c.distanceKm : 5;
    if (dist < closestKm) closestKm = dist;

    // Recent confirmed cases within 3km give the highest risk weight
    if (dist <= 3) score += 6;
    else if (dist <= 6) score += 4;
    else score += 2;
  });

  return {
    score: Math.min(Math.round(score), 20),
    count: cases.length,
    status: cases.length >= 6 ? 'High Cluster Pressure' : cases.length >= 2 ? 'Moderate Area Reports' : 'Isolated Cases',
    closestKm: closestKm === Infinity ? null : Math.round(closestKm * 10) / 10,
  };
}

/**
 * Calculates AI confidence modifier (-5 to +5 points).
 * If AI is very confident (> 85%), risk assessment holds higher weight.
 */
function computeConfidenceFactor(confidence) {
  if (confidence === null || confidence === undefined) return 0;
  const conf = confidence > 1 ? confidence / 100 : confidence; // normalize 0-1
  if (conf >= 0.85) return 5;
  if (conf >= 0.65) return 0;
  return -5; // lower confidence attenuates risk alarm
}

function getRiskLevel(score) {
  if (score <= 35) return 'LOW';
  if (score <= 65) return 'MODERATE';
  return 'HIGH';
}

/**
 * Evaluates comprehensive crop risk.
 *
 * @param {object} params
 * @param {string} params.crop - e.g. "onion", "tomato"
 * @param {string} [params.disease] - e.g. "purple_blotch"
 * @param {number} [params.confidence] - e.g. 0.91 or 91
 * @param {number} params.temperature - current or forecasted temp in °C
 * @param {number} params.humidity - relative humidity in %
 * @param {number} [params.rainfallMm] - rainfall in mm
 * @param {number} [params.rainProbability] - rain chance in %
 * @param {string} [params.cropStage] - e.g. "flowering", "vegetative"
 * @param {Array}  [params.nearbyCases] - array of nearby diagnosis reports
 * @param {object} [params.location] - { latitude, longitude, taluka, district }
 *
 * @returns {object} { score, level, reasons, factors, breakdown }
 */
function calculateCropRisk(params = {}) {
  const {
    crop = 'onion',
    disease = 'purple_blotch',
    confidence = 0.91,
    temperature = 26,
    humidity = 82,
    rainfallMm = 4,
    rainProbability = 65,
    cropStage = 'flowering',
    nearbyCases = [],
  } = params;

  const profile = getPathogenProfile(disease);
  const humidityFactor = computeHumidityFactor(humidity, profile.criticalHumidity);
  const rainFactor = computeRainFactor(rainfallMm, rainProbability, profile.rainDriven);
  const tempFactor = computeTemperatureFactor(temperature, profile);
  const stageFactor = computeCropStageFactor(cropStage);
  const nearbyFactor = computeNearbyCasesFactor(nearbyCases);
  const confModifier = computeConfidenceFactor(confidence);

  // Sum factors (Max: 25 + 25 + 15 + 15 + 20 = 100 pts)
  const rawScore =
    humidityFactor.score +
    rainFactor.score +
    tempFactor.score +
    stageFactor.score +
    nearbyFactor.score +
    confModifier;

  const finalScore = Math.max(5, Math.min(100, Math.round(rawScore)));
  const level = getRiskLevel(finalScore);

  // Build transparent, non-contradictory reasons
  const reasons = [];

  if (humidityFactor.status === 'High') {
    reasons.push(`High relative humidity (${humidityFactor.value}%) creates favorable conditions for ${profile.name}`);
  } else if (humidityFactor.status === 'Moderate') {
    reasons.push(`Moderate humidity (${humidityFactor.value}%) supports pathogen incubation`);
  } else {
    reasons.push(`Lower humidity (${humidityFactor.value}%) helps suppress disease development`);
  }

  if (rainFactor.status === 'High') {
    reasons.push(`Rainfall forecast (${rainFactor.rainProbability}% probability) accelerates spore dispersal via rain splash`);
  } else if (rainFactor.status === 'Moderate') {
    reasons.push(`Scattered rainfall / cloudiness (${rainFactor.rainProbability}%) maintains leaf moisture`);
  } else {
    reasons.push('Dry weather conditions expected with minimal rain-driven risk');
  }

  if (stageFactor.susceptibility === 'Susceptible') {
    reasons.push(`Crop is in susceptible ${stageFactor.stage}`);
  }

  if (nearbyFactor.count > 0) {
    const distText = nearbyFactor.closestKm ? ` (closest: ${nearbyFactor.closestKm} km)` : '';
    reasons.push(`${nearbyFactor.count} nearby disease report(s) in active area${distText}`);
  }

  if (reasons.length === 0) {
    reasons.push('Favorable, stable conditions across crop canopy');
  }

  return {
    score: finalScore,
    level,
    crop,
    disease,
    reasons,
    breakdown: {
      temperature: tempFactor.status,
      temperatureValue: `${tempFactor.value}°C`,
      humidity: humidityFactor.status,
      humidityValue: `${humidityFactor.value}%`,
      rainfall: rainFactor.status,
      rainfallValue: `${rainFactor.rainProbability}% chance (${rainFactor.rainfallMm}mm)`,
      nearbyReports: nearbyFactor.count,
      cropStage: `${stageFactor.stage} (${stageFactor.susceptibility})`,
      overallRisk: `${finalScore} / 100`,
    },
    factors: {
      humidity_factor: humidityFactor.score,
      rain_factor: rainFactor.score,
      temperature_factor: tempFactor.score,
      crop_stage_factor: stageFactor.score,
      nearby_cases_factor: nearbyFactor.score,
    },
  };
}

/**
 * Calculates a dynamic 5-day risk forecast based on daily weather forecast points.
 */
function calculate5DayRiskForecast(baseParams = {}, dailyForecast = []) {
  if (!Array.isArray(dailyForecast) || dailyForecast.length === 0) {
    // Generate deterministic 5-day series based on base params
    const days = [];
    const baseDate = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dayOffset = (i === 1 || i === 2) ? 8 : (i === 4 ? -6 : 0);
      const dayHum = Math.min(95, Math.max(50, (baseParams.humidity || 80) + dayOffset));
      const dayRain = Math.min(95, Math.max(10, (baseParams.rainProbability || 60) + dayOffset * 2));
      const dayRisk = calculateCropRisk({
        ...baseParams,
        humidity: dayHum,
        rainProbability: dayRain,
      });

      days.push({
        day_index: i,
        date: d.toISOString().slice(0, 10),
        score: dayRisk.score,
        level: dayRisk.level,
        humidity: dayHum,
        rainProbability: dayRain,
        reasons: dayRisk.reasons,
        breakdown: dayRisk.breakdown,
      });
    }
    return days;
  }

  return dailyForecast.slice(0, 5).map((df, index) => {
    const dayRisk = calculateCropRisk({
      ...baseParams,
      temperature: df.max_temp_c ?? df.temperature_c ?? baseParams.temperature,
      humidity: df.humidity_percent ?? baseParams.humidity,
      rainfallMm: df.rainfall_mm ?? 0,
      rainProbability: df.rain_probability_percent ?? baseParams.rainProbability,
    });

    return {
      day_index: index,
      date: df.date || new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
      score: dayRisk.score,
      level: dayRisk.level,
      max_temp_c: df.max_temp_c,
      min_temp_c: df.min_temp_c,
      humidity: df.humidity_percent,
      rainfall_mm: df.rainfall_mm,
      rain_probability_percent: df.rain_probability_percent,
      reasons: dayRisk.reasons,
      breakdown: dayRisk.breakdown,
    };
  });
}

module.exports = {
  calculateCropRisk,
  calculate5DayRiskForecast,
  getRiskLevel,
  CROP_STAGE_VULNERABILITY,
  PATHOGEN_PROFILES,
};
