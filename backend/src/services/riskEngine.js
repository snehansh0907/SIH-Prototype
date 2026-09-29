// =========================================================
// Pashu Sarthak - Livestock Bioclimatic Disease & Heat Stress Risk Engine
// =========================================================
// Implements veterinary epidemiological models for livestock health:
//   1. Temperature-Humidity Index (THI) for cattle & buffalo heat stress
//      Equation (National Research Council / Dairy Science):
//      THI = 0.8 * T + (RH / 100) * (T - 14.4) + 46.4
//      - THI < 72: Normal / Comfortable
//      - 72 <= THI <= 78: Mild Heat Stress (respiration up, 5-10% milk yield decline)
//      - 79 <= THI <= 88: Moderate Heat Stress (salivation, 15-25% milk drop, immunosuppression)
//      - THI > 88: Severe Heat Stress / Emergency (panting, danger of heat stroke & death)
//
//   2. Vector-Borne Disease Proliferation Risk (Lumpy Skin Disease - LSD)
//      - Mechanically transmitted by biting stable flies (Stomoxys calcitrans),
//        mosquitoes (Aedes, Culex), and ticks (Rhipicephalus appendiculatus).
//      - Proliferation peaks during warm (22°C - 35°C), high humidity (> 70%),
//        and stagnant post-rainfall conditions.
//
//   3. Seasonal Foot-and-Mouth Disease (FMD) Environmental Factor
//      - Aphthovirus aerosol survival and transmission peak during cool-to-moderate
//        temperatures (15°C - 28°C) with elevated relative humidity (> 60%).
//
//   4. Species & Physiological Stage Vulnerability
//      - High-yielding crossbred cattle (HF/Jersey) & lactating cows (high metabolic load)
//      - Buffaloes (poor thermoregulation due to fewer sweat glands)
//      - Calves and young stock (developing immunity)
//      - Indigenous cattle (Gir/Sahiwal/Khillari - hardier)
//
//   5. Nearby Outbreak Ring Surveillance Pressure (3 km - 10 km)
// =========================================================

/**
 * Vulnerability weights for livestock species and life/production stages.
 */
const LIVESTOCK_VULNERABILITY = {
  crossbred_lactating: { weight: 1.0, label: 'Crossbred Lactating Cattle (HF/Jersey)', susceptibility: 'High' },
  buffalo_milch: { weight: 0.9, label: 'Milch Buffalo (Murrah/Jafrabadi)', susceptibility: 'High (Heat Sensitive)' },
  indigenous_cattle: { weight: 0.65, label: 'Indigenous Cattle (Gir/Sahiwal/Khillari)', susceptibility: 'Moderate' },
  calves_young: { weight: 0.85, label: 'Calves & Young Stock (< 1 Year)', susceptibility: 'High (Immunity Developing)' },
  goat_sheep: { weight: 0.6, label: 'Small Ruminants (Goat/Sheep)', susceptibility: 'Moderate' },
  poultry_flock: { weight: 0.8, label: 'Poultry Flock (Broiler/Layer)', susceptibility: 'Moderate-High (Heat Sensitive)' },
  dry_cattle: { weight: 0.5, label: 'Dry / Non-Lactating Cattle', susceptibility: 'Low-Moderate' },
  // Backwards compatibility mappings for existing crop stages
  flowering: { weight: 0.95, label: 'Milch / Peak Lactation Herd', susceptibility: 'High' },
  vegetative: { weight: 0.7, label: 'Growing Stock / Heifers', susceptibility: 'Moderate' },
  seedling: { weight: 0.85, label: 'Young Calves', susceptibility: 'High' },
  fruiting: { weight: 0.95, label: 'Lactating Cows', susceptibility: 'High' },
  maturity: { weight: 0.5, label: 'Mature / Dry Cows', susceptibility: 'Low' },
  sowing: { weight: 0.4, label: 'Calf Pens', susceptibility: 'Moderate' },
};

/**
 * Livestock Pathogen Bioclimatic Profiles.
 */
const LIVESTOCK_PATHOGEN_PROFILES = {
  lumpy_skin_disease: {
    name: 'Lumpy Skin Disease (Capripoxvirus)',
    optimalTempMin: 22,
    optimalTempMax: 35,
    criticalHumidity: 70,
    vectorDriven: true,
    description: 'Biting flies (Stomoxys) and mosquitoes thrive in warm humid conditions',
  },
  foot_and_mouth_disease: {
    name: 'Foot-and-Mouth Disease (Aphthovirus)',
    optimalTempMin: 15,
    optimalTempMax: 28,
    criticalHumidity: 65,
    vectorDriven: false,
    aerosolDriven: true,
    description: 'Aerosol viral transmission is prolonged under cool, damp conditions',
  },
  hemorrhagic_septicemia: {
    name: 'Hemorrhagic Septicemia (Pasteurella multocida)',
    optimalTempMin: 20,
    optimalTempMax: 34,
    criticalHumidity: 75,
    vectorDriven: false,
    rainDriven: true,
    description: 'Post-monsoon water logging, stress, and sudden temperature shifts',
  },
  heat_stress: {
    name: 'Bovine Heat Stress & Milk Drop',
    optimalTempMin: 28,
    optimalTempMax: 45,
    criticalHumidity: 60,
    vectorDriven: false,
    description: 'Combined high ambient heat and humidity impairs ruminant cooling',
  },
  default: {
    name: 'Livestock Epizootic Risk',
    optimalTempMin: 20,
    optimalTempMax: 35,
    criticalHumidity: 70,
    vectorDriven: true,
  },
};

/**
 * Calculates Temperature-Humidity Index (THI) for cattle and buffalo.
 * Standard National Research Council formula:
 * THI = 0.8 * T + (RH / 100) * (T - 14.4) + 46.4
 */
function computeTHI(temperatureC, relativeHumidity) {
  const T = Number(temperatureC) || 25;
  const RH = Math.max(0, Math.min(100, Number(relativeHumidity) || 65));
  const thi = 0.8 * T + (RH / 100) * (T - 14.4) + 46.4;
  const roundedTHI = Math.round(thi * 10) / 10;

  let status = 'Comfortable';
  let category = 'normal';
  let score = 5;
  let milkDropPercent = 0;

  if (roundedTHI >= 89) {
    status = 'Severe Heat Stress (Emergency)';
    category = 'severe';
    score = 30;
    milkDropPercent = 25;
  } else if (roundedTHI >= 79) {
    status = 'Moderate Heat Stress';
    category = 'moderate';
    score = 22;
    milkDropPercent = 15;
  } else if (roundedTHI >= 72) {
    status = 'Mild Heat Stress';
    category = 'mild';
    score = 12;
    milkDropPercent = 5;
  } else {
    status = 'Comfortable / Normal';
    category = 'normal';
    score = 4;
    milkDropPercent = 0;
  }

  return {
    thi: roundedTHI,
    status,
    category,
    score,
    milkDropEstimate: `${milkDropPercent}% expected decline if uncooled`,
  };
}

/**
 * Calculates Vector Proliferation Risk (0 - 25 points).
 * Evaluates biting fly (Stomoxys calcitrans) and mosquito population boom.
 */
function computeVectorProliferationFactor(temperatureC, humidityPercent, rainfallMm = 0) {
  const temp = Number(temperatureC) || 25;
  const hum = Math.max(0, Math.min(100, Number(humidityPercent) || 65));
  const rain = Math.max(0, Number(rainfallMm) || 0);

  let score = 5;
  let status = 'Low Vector Activity';

  // Peak vector conditions: 22°C - 35°C and RH > 70% or standing rain
  const tempOptimal = temp >= 22 && temp <= 35;
  const humHigh = hum >= 70;
  const standingWater = rain >= 3;

  if (tempOptimal && humHigh && standingWater) {
    score = 25;
    status = 'High Vector Proliferation (Stomoxys & Mosquitoes Active)';
  } else if (tempOptimal && (humHigh || standingWater)) {
    score = 19;
    status = 'Elevated Vector Activity (LSD Risk Warning)';
  } else if (temp >= 20 && hum >= 55) {
    score = 12;
    status = 'Moderate Fly & Vector Presence';
  } else {
    score = 4;
    status = 'Low Vector Pressure (Dry / Cool)';
  }

  return { score, status, isFavorableForVectors: score >= 15 };
}

/**
 * Calculates Seasonal Foot-and-Mouth Disease (FMD) Environmental Correlation (0 - 20 points).
 * Aphthovirus thrives in aerosol at cool-to-moderate temperatures (15°C - 28°C) and high humidity.
 */
function computeFMDEnvironmentalFactor(temperatureC, humidityPercent) {
  const temp = Number(temperatureC) || 25;
  const hum = Math.max(0, Math.min(100, Number(humidityPercent) || 65));

  let score = 4;
  let status = 'Low Aerosol Persistence';

  if (temp >= 15 && temp <= 27 && hum >= 65) {
    score = 20;
    status = 'High Aphthovirus Aerosol Transmission Risk';
  } else if (temp >= 15 && temp <= 30 && hum >= 50) {
    score = 12;
    status = 'Moderate Viral Persistence in Air';
  } else if (temp > 35 || hum < 40) {
    score = 3;
    status = 'Unfavorable for Viral Aerosol (Dry/Hot Inactivation)';
  }

  return { score, status };
}

/**
 * Calculates livestock herd species/stage vulnerability (0 - 15 points).
 */
function computeLivestockVulnerabilityFactor(stageOrSpecies = 'crossbred_lactating') {
  const key = String(stageOrSpecies).toLowerCase().trim().replace(/[\s-]+/g, '_');
  const info = LIVESTOCK_VULNERABILITY[key] || LIVESTOCK_VULNERABILITY.crossbred_lactating;
  const score = Math.round(info.weight * 15);
  return { score, stage: info.label, susceptibility: info.susceptibility };
}

/**
 * Calculates nearby livestock disease outbreak pressure (0 - 20 points).
 * Focuses on ring vaccination zones (3 km ring and 10 km surveillance).
 */
function computeNearbyOutbreakFactor(nearbyCases = []) {
  const cases = Array.isArray(nearbyCases) ? nearbyCases : [];
  if (cases.length === 0) {
    return { score: 0, count: 0, status: 'No nearby livestock outbreaks', closestKm: null };
  }

  let score = 0;
  let closestKm = Infinity;

  cases.forEach((c) => {
    const dist = typeof c.distance_km === 'number' ? c.distance_km : typeof c.distanceKm === 'number' ? c.distanceKm : 5;
    if (dist < closestKm) closestKm = dist;

    // Cases within 3 km ring vaccination zone trigger critical alert
    if (dist <= 3) score += 7;
    else if (dist <= 6) score += 4;
    else score += 2;
  });

  return {
    score: Math.min(Math.round(score), 20),
    count: cases.length,
    status: cases.length >= 4 ? 'Active Outbreak Cluster (Ring Vaccination Zone)' : cases.length >= 2 ? 'Local Village Cases Reported' : 'Isolated Case in Taluka',
    closestKm: closestKm === Infinity ? null : Math.round(closestKm * 10) / 10,
  };
}

/**
 * Confidence score modifier (-5 to +5 points).
 */
function computeConfidenceFactor(confidence) {
  if (confidence === null || confidence === undefined) return 0;
  const conf = confidence > 1 ? confidence / 100 : confidence;
  if (conf >= 0.85) return 5;
  if (conf >= 0.65) return 0;
  return -5;
}

function getRiskLevel(score) {
  if (score <= 35) return 'LOW';
  if (score <= 65) return 'MODERATE';
  return 'HIGH';
}

/**
 * Calculates comprehensive livestock disease and heat stress risk.
 *
 * @param {object} params
 * @param {string} [params.species] - e.g. "cattle", "buffalo", "goat"
 * @param {string} [params.disease] - e.g. "lumpy_skin_disease", "foot_and_mouth_disease"
 * @param {number} params.temperature - in °C
 * @param {number} params.humidity - relative humidity in %
 * @param {number} [params.rainfallMm] - rainfall in mm
 * @param {number} [params.rainProbability] - rain chance in %
 * @param {string} [params.cropStage] - species/stage key
 * @param {Array}  [params.nearbyCases] - array of nearby outbreak cases
 *
 * @returns {object} { score, level, reasons, factors, breakdown }
 */
function calculateLivestockRisk(params = {}) {
  const {
    crop = 'cattle',
    species = 'cattle',
    disease = 'lumpy_skin_disease',
    confidence = 0.91,
    temperature = 28,
    humidity = 80,
    rainfallMm = 5,
    rainProbability = 65,
    cropStage = 'crossbred_lactating',
    nearbyCases = [],
  } = params;

  const targetDisease = (disease || '').toLowerCase().includes('foot') || (disease || '').toLowerCase().includes('fmd')
    ? 'foot_and_mouth_disease'
    : 'lumpy_skin_disease';

  // 1. NRC Temperature-Humidity Index (THI)
  const thiData = computeTHI(temperature, humidity);

  // 2. Vector proliferation (LSD biting flies)
  const vectorData = computeVectorProliferationFactor(temperature, humidity, rainfallMm);

  // 3. FMD viral aerosol transmission factor
  const fmdData = computeFMDEnvironmentalFactor(temperature, humidity);

  // 4. Animal stage and species susceptibility
  const vulData = computeLivestockVulnerabilityFactor(cropStage);

  // 5. Outbreak pressure in nearby villages
  const nearbyData = computeNearbyOutbreakFactor(nearbyCases);

  // 6. Confidence modifier
  const confModifier = computeConfidenceFactor(confidence);

  // Disease-weighted risk combination:
  let diseaseScore = 0;
  if (targetDisease === 'lumpy_skin_disease') {
    diseaseScore = vectorData.score + Math.round(thiData.score * 0.7);
  } else {
    diseaseScore = fmdData.score + Math.round(thiData.score * 0.6);
  }

  const rawScore =
    diseaseScore +
    vulData.score +
    nearbyData.score +
    confModifier;

  const finalScore = Math.max(5, Math.min(100, Math.round(rawScore)));
  const level = getRiskLevel(finalScore);

  // Build transparent reasons for veterinary action
  const reasons = [];

  if (thiData.category === 'severe') {
    reasons.push(`Severe heat stress warning (THI ${thiData.thi}): High risk of panting, acute milk yield decline, and heat exhaustion`);
  } else if (thiData.category === 'moderate') {
    reasons.push(`Moderate heat stress (THI ${thiData.thi}): Ruminants prone to ~${thiData.milkDropEstimate}; provide shaded ventilation`);
  } else if (thiData.category === 'mild') {
    reasons.push(`Mild heat discomfort (THI ${thiData.thi}): Ensure abundant cool drinking water`);
  }

  if (vectorData.isFavorableForVectors) {
    reasons.push(`Humid conditions (${humidity}%) accelerate biting fly (Stomoxys) & mosquito proliferation (primary LSD vector)`);
  }

  if (targetDisease === 'foot_and_mouth_disease' && fmdData.score >= 12) {
    reasons.push(`Current temperature (${temperature}°C) and humidity favor Aphthovirus aerosol survival and transmission`);
  }

  if (nearbyData.count > 0) {
    const distText = nearbyData.closestKm ? ` (closest: ${nearbyData.closestKm} km)` : '';
    reasons.push(`${nearbyData.count} nearby livestock disease case(s) reported${distText}`);
  }

  if (vulData.susceptibility.includes('High')) {
    reasons.push(`Herd contains highly susceptible stock: ${vulData.stage}`);
  }

  if (reasons.length === 0) {
    reasons.push('Current shed microclimate and biosecurity conditions are within normal limits');
  }

  return {
    score: finalScore,
    level,
    species: species || crop,
    crop: species || crop,
    disease: targetDisease,
    reasons,
    thi: thiData.thi,
    thiStatus: thiData.status,
    breakdown: {
      temperature: `${temperature}°C`,
      temperatureValue: `${temperature}°C`,
      humidity: `${humidity}%`,
      humidityValue: `${humidity}%`,
      thi: `${thiData.thi} (${thiData.status})`,
      vectorRisk: vectorData.status,
      rainfall: `${rainProbability}% chance (${rainfallMm}mm)`,
      rainfallValue: `${rainProbability}% chance (${rainfallMm}mm)`,
      nearbyReports: nearbyData.count,
      cropStage: `${vulData.stage} (${vulData.susceptibility})`,
      overallRisk: `${finalScore} / 100`,
    },
    factors: {
      thi_factor: thiData.score,
      vector_factor: vectorData.score,
      fmd_factor: fmdData.score,
      humidity_factor: Math.round((humidity / 100) * 20),
      rain_factor: Math.min(20, Math.round(rainfallMm * 2 + rainProbability * 0.1)),
      temperature_factor: thiData.score,
      crop_stage_factor: vulData.score,
      nearby_cases_factor: nearbyData.score,
    },
  };
}

/**
 * Calculates a dynamic 5-day risk forecast based on daily weather forecast points.
 */
function calculate5DayRiskForecast(baseParams = {}, dailyForecast = []) {
  if (!Array.isArray(dailyForecast) || dailyForecast.length === 0) {
    const days = [];
    const baseDate = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dayOffset = (i === 1 || i === 2) ? 6 : (i === 4 ? -4 : 0);
      const dayHum = Math.min(95, Math.max(50, (baseParams.humidity || 78) + dayOffset));
      const dayTemp = Math.min(42, Math.max(20, (baseParams.temperature || 28) + (i === 2 ? 3 : 0)));
      const dayRisk = calculateLivestockRisk({
        ...baseParams,
        temperature: dayTemp,
        humidity: dayHum,
      });

      days.push({
        day_index: i,
        date: d.toISOString().slice(0, 10),
        score: dayRisk.score,
        level: dayRisk.level,
        thi: dayRisk.thi,
        humidity: dayHum,
        temperature: dayTemp,
        reasons: dayRisk.reasons,
        breakdown: dayRisk.breakdown,
      });
    }
    return days;
  }

  return dailyForecast.slice(0, 5).map((df, index) => {
    const dayTemp = df.max_temp_c ?? df.temperature_c ?? baseParams.temperature ?? 28;
    const dayHum = df.humidity_percent ?? baseParams.humidity ?? 75;
    const dayRisk = calculateLivestockRisk({
      ...baseParams,
      temperature: dayTemp,
      humidity: dayHum,
      rainfallMm: df.rainfall_mm ?? 0,
      rainProbability: df.rain_probability_percent ?? baseParams.rainProbability ?? 40,
    });

    return {
      day_index: index,
      date: df.date || new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
      score: dayRisk.score,
      level: dayRisk.level,
      thi: dayRisk.thi,
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
  calculateLivestockRisk,
  calculateCropRisk: calculateLivestockRisk, // 100% backwards compatible alias
  calculate5DayRiskForecast,
  computeTHI,
  getRiskLevel,
  LIVESTOCK_VULNERABILITY,
  CROP_STAGE_VULNERABILITY: LIVESTOCK_VULNERABILITY, // compatibility
  LIVESTOCK_PATHOGEN_PROFILES,
  PATHOGEN_PROFILES: LIVESTOCK_PATHOGEN_PROFILES, // compatibility
};
