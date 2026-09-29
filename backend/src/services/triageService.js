// =========================================================
// Pashu Sarthak - Rule-Based Outbreak Triage Engine
// Problem Statement 26128 - Govt. of Maharashtra
// Spatio-Temporal Cluster Evaluation Service
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const triageConfig = require('../config/triageConfig');
const { supabase } = require('../config/supabase');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTBREAKS_FILE = path.join(DATA_DIR, 'outbreak_alerts.json');
const DIAGNOSES_FILE = path.join(DATA_DIR, 'diagnosis_cases.json');
const MORTALITY_FILE = path.join(DATA_DIR, 'mortality_reports.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Calculate Great-Circle Distance using Haversine formula (in kilometers)
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0.5; // Assume local cluster if exact coordinates missing in fallback
  }

  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalize condition string to match common epidemic strains
 */
function normalizeConditionKey(conditionStr) {
  if (!conditionStr) return 'general_infection';
  const clean = String(conditionStr).toLowerCase().replace(/[^a-z0-9]/g, ' ');

  if (clean.includes('lumpy') || clean.includes('lsd') || clean.includes('nodule')) {
    return 'Lumpy Skin Disease';
  }
  if (clean.includes('anthrax') || clean.includes('sudden death') || clean.includes('blood discharge')) {
    return 'Anthrax';
  }
  if (clean.includes('hs') || clean.includes('hemorrhagic') || clean.includes('throat swelling') || clean.includes('galghotu')) {
    return 'Hemorrhagic Septicemia (HS)';
  }
  if (clean.includes('bq') || clean.includes('black quarter') || clean.includes('ektangya')) {
    return 'Black Quarter (BQ)';
  }
  if (clean.includes('fmd') || clean.includes('foot and mouth') || clean.includes('khurkut')) {
    return 'Foot and Mouth Disease (FMD)';
  }
  if (clean.includes('ppr') || clean.includes('goat plague')) {
    return 'Peste des Petits Ruminants (PPR)';
  }
  if (clean.includes('avian') || clean.includes('bird flu') || clean.includes('poultry mortality')) {
    return 'Avian Influenza';
  }
  if (clean.includes('enterotoxemia') || clean.includes('bloat') || clean.includes('poison')) {
    return 'Enterotoxemia / Bloat';
  }
  return conditionStr.trim();
}

/**
 * Read stored outbreaks
 */
function getStoredOutbreaks() {
  try {
    if (fs.existsSync(OUTBREAKS_FILE)) {
      const data = fs.readFileSync(OUTBREAKS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[triageService] Failed to read outbreak_alerts.json:', err.message);
  }
  return [];
}

/**
 * Save outbreaks
 */
function saveStoredOutbreaks(outbreaks) {
  try {
    fs.writeFileSync(OUTBREAKS_FILE, JSON.stringify(outbreaks, null, 2));
  } catch (err) {
    console.warn('[triageService] Failed to save outbreak_alerts.json:', err.message);
  }
}

/**
 * Read all combined cases (symptom + mortality)
 */
function getAllSurveillanceCases() {
  let list = [];
  try {
    if (fs.existsSync(DIAGNOSES_FILE)) {
      const data = fs.readFileSync(DIAGNOSES_FILE, 'utf-8');
      list = JSON.parse(data);
    }
  } catch {}
  return list;
}

/**
 * Core Rule-Based Triage Engine
 * Evaluates spatio-temporal cluster for newly filed symptom case or mortality report.
 * Radius: 5.0 km, Time Window: 7 days, Threshold: 3+ cases / 2+ mortalities.
 */
function evaluateTriageForNewReport(newReport) {
  const allCases = getAllSurveillanceCases();
  const currentOutbreaks = getStoredOutbreaks();

  const reportLat = typeof newReport.latitude === 'number' ? newReport.latitude : triageConfig.DEFAULT_LATITUDE;
  const reportLng = typeof newReport.longitude === 'number' ? newReport.longitude : triageConfig.DEFAULT_LONGITUDE;
  const reportTime = new Date(newReport.created_at || Date.now()).getTime();

  const reportConditionKey = normalizeConditionKey(
    newReport.disease_name || newReport.suspected_cause || newReport.crop_name
  );
  const reportSpecies = (newReport.species || 'cattle').toLowerCase();

  const windowMs = triageConfig.OUTBREAK_TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const radiusKm = triageConfig.OUTBREAK_RADIUS_KM;

  // 1. Find all cases within (Radius <= 5km) AND (Time <= 7 days) AND (Matching Condition or Species)
  const nearbyMatchingCases = allCases.filter((c) => {
    const cTime = new Date(c.created_at || Date.now()).getTime();
    if (Math.abs(reportTime - cTime) > windowMs) {
      return false; // Outside time window
    }

    const cLat = typeof c.latitude === 'number' ? c.latitude : triageConfig.DEFAULT_LATITUDE;
    const cLng = typeof c.longitude === 'number' ? c.longitude : triageConfig.DEFAULT_LONGITUDE;
    const distanceKm = calculateHaversineDistanceKm(reportLat, reportLng, cLat, cLng);

    if (distanceKm > radiusKm) {
      return false; // Outside geographic radius
    }

    const cConditionKey = normalizeConditionKey(c.disease_name || c.suspected_cause);
    const cSpecies = (c.species || '').toLowerCase();

    // Match either exact condition key or high priority species cluster
    const isConditionMatch =
      cConditionKey.toLowerCase() === reportConditionKey.toLowerCase() ||
      cConditionKey.toLowerCase().includes(reportConditionKey.toLowerCase()) ||
      reportConditionKey.toLowerCase().includes(cConditionKey.toLowerCase());

    const isSpeciesMatch = cSpecies === reportSpecies;

    return isConditionMatch || (isSpeciesMatch && c.severity === 'high');
  });

  // Include the new report if not yet counted
  const clusterCaseIds = new Set(nearbyMatchingCases.map((c) => c.id || c.case_id));
  clusterCaseIds.add(newReport.id || newReport.case_id);

  let symptomCount = 0;
  let mortalityCount = 0;

  nearbyMatchingCases.forEach((c) => {
    if (c.report_type === 'mortality') {
      mortalityCount++;
    } else {
      symptomCount++;
    }
  });

  if (newReport.report_type === 'mortality') {
    mortalityCount++;
  } else {
    symptomCount++;
  }

  const totalCases = symptomCount + mortalityCount;
  const weightedScore =
    symptomCount * triageConfig.SYMPTOM_WEIGHT + mortalityCount * triageConfig.MORTALITY_WEIGHT;

  const isThresholdCrossed =
    symptomCount >= triageConfig.SYMPTOM_CASE_THRESHOLD ||
    mortalityCount >= triageConfig.MORTALITY_CASE_THRESHOLD ||
    weightedScore >= triageConfig.COMBINED_WEIGHTED_THRESHOLD;

  if (isThresholdCrossed) {
    const clusterVillage = newReport.village || (newReport.location ? newReport.location.split(',')[0].trim() : 'Niphad');
    const clusterTaluka = newReport.taluka || 'Niphad';
    const clusterDistrict = newReport.district || 'Nashik';

    // Check if there is already an active outbreak for this condition & cluster
    let existingOutbreak = currentOutbreaks.find(
      (o) =>
        o.status !== 'CONTAINED' &&
        o.disease_name.toLowerCase() === reportConditionKey.toLowerCase() &&
        calculateHaversineDistanceKm(o.cluster_center.latitude, o.cluster_center.longitude, reportLat, reportLng) <= radiusKm
    );

    let activeAlert;
    if (existingOutbreak) {
      existingOutbreak.symptom_case_count = symptomCount;
      existingOutbreak.mortality_case_count = mortalityCount;
      existingOutbreak.total_case_count = totalCases;
      existingOutbreak.case_ids = Array.from(clusterCaseIds);
      existingOutbreak.updated_at = new Date().toISOString();
      activeAlert = existingOutbreak;
    } else {
      activeAlert = {
        id: `outbreak-${uuidv4()}`,
        outbreak_code: `EPI-MH-NIP-${Date.now().toString().slice(-4)}`,
        disease_name: reportConditionKey,
        species: reportSpecies,
        cluster_center: {
          village: clusterVillage,
          taluka: clusterTaluka,
          district: clusterDistrict,
          latitude: reportLat,
          longitude: reportLng,
        },
        radius_km: radiusKm,
        time_window_days: triageConfig.OUTBREAK_TIME_WINDOW_DAYS,
        symptom_case_count: symptomCount,
        mortality_case_count: mortalityCount,
        total_case_count: totalCases,
        threshold_crossed: weightedScore,
        case_ids: Array.from(clusterCaseIds),
        status: 'ACTIVE',
        flagged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        priority: mortalityCount > 0 ? 'CRITICAL' : 'HIGH',
        containment_advisory: `Immediate quarantine protocol: Vaccinate susceptible herds within ${radiusKm}km ring; restrict cattle transport out of ${clusterTaluka}.`,
      };
      currentOutbreaks.unshift(activeAlert);
    }

    saveStoredOutbreaks(currentOutbreaks);

    // Flag all clustered cases in diagnosis_cases.json
    try {
      const updatedList = allCases.map((c) => {
        if (clusterCaseIds.has(c.id) || clusterCaseIds.has(c.case_id)) {
          return {
            ...c,
            is_outbreak_flagged: true,
            outbreak_id: activeAlert.id,
            // Per requirement 5: auto-escalate cases linked to an outbreak
            status: c.status === 'New' || !c.status ? 'Escalated' : c.status,
          };
        }
        return c;
      });
      fs.writeFileSync(DIAGNOSES_FILE, JSON.stringify(updatedList, null, 2));
    } catch {}

    return {
      isOutbreakFlagged: true,
      outbreakAlert: activeAlert,
      clusterCount: totalCases,
      symptomCount,
      mortalityCount,
    };
  }

  return {
    isOutbreakFlagged: false,
    clusterCount: totalCases,
    symptomCount,
    mortalityCount,
  };
}

/**
 * Get all outbreaks
 */
function getAllOutbreaks() {
  return getStoredOutbreaks();
}

/**
 * Seed initial sample outbreaks for realistic demo if empty
 */
function seedDemoOutbreaksIfEmpty() {
  const list = getStoredOutbreaks();
  if (list.length === 0) {
    const demoAlert = {
      id: 'outbreak-niphad-lsd-001',
      outbreak_code: 'EPI-MH-NIP-2026-01',
      disease_name: 'Lumpy Skin Disease',
      species: 'cattle',
      cluster_center: {
        village: 'Chandori & Niphad Central',
        taluka: 'Niphad',
        district: 'Nashik',
        latitude: 20.0825,
        longitude: 74.1112,
      },
      radius_km: 5.0,
      time_window_days: 7,
      symptom_case_count: 4,
      mortality_case_count: 1,
      total_case_count: 5,
      threshold_crossed: 5.5,
      case_ids: ['case-seed-001', 'case-seed-002', 'mort-seed-001'],
      status: 'ACTIVE',
      priority: 'CRITICAL',
      flagged_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      containment_advisory: 'Immediate Ring Vaccination (Goat Pox vaccine) required within 5km of Chandori-Niphad belt. Restrict live cattle bazaars.',
    };
    saveStoredOutbreaks([demoAlert]);
  }
}

// Seed demo outbreaks on initialization
seedDemoOutbreaksIfEmpty();

module.exports = {
  evaluateTriageForNewReport,
  getAllOutbreaks,
  getStoredOutbreaks,
  saveStoredOutbreaks,
  calculateHaversineDistanceKm,
  normalizeConditionKey,
};
