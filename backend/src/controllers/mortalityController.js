// =========================================================
// Pashu Sarthak - Animal Mortality Surveillance Controller
// Problem Statement 26128 - Govt. of Maharashtra
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LOCAL_MORTALITY_FILE = path.join(DATA_DIR, 'mortality_reports.json');
const LOCAL_DIAGNOSES_FILE = path.join(DATA_DIR, 'diagnosis_cases.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getLocalMortalityReports() {
  try {
    if (fs.existsSync(LOCAL_MORTALITY_FILE)) {
      const data = fs.readFileSync(LOCAL_MORTALITY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[mortalityController] Failed to read mortality_reports.json:', err.message);
  }
  return [];
}

function saveLocalMortalityReports(reports) {
  try {
    fs.writeFileSync(LOCAL_MORTALITY_FILE, JSON.stringify(reports, null, 2));
  } catch (err) {
    console.warn('[mortalityController] Failed to save mortality_reports.json:', err.message);
  }
}

function syncToDiagnosisCases(mortalityRecord) {
  try {
    let diagnoses = [];
    if (fs.existsSync(LOCAL_DIAGNOSES_FILE)) {
      diagnoses = JSON.parse(fs.readFileSync(LOCAL_DIAGNOSES_FILE, 'utf-8'));
    }

    const unifiedCase = {
      id: mortalityRecord.id,
      case_id: mortalityRecord.id,
      report_type: 'mortality',
      farmer_id: mortalityRecord.farmer_id,
      farmer_name: mortalityRecord.farmer_name,
      farmer_phone: mortalityRecord.farmer_phone,
      farm_id: mortalityRecord.farm_id,
      village: mortalityRecord.village,
      taluka: mortalityRecord.taluka,
      district: mortalityRecord.district,
      latitude: mortalityRecord.latitude,
      longitude: mortalityRecord.longitude,
      species: mortalityRecord.species,
      disease_name: `Mortality: ${mortalityRecord.suspected_cause}`,
      suspected_cause: mortalityRecord.suspected_cause,
      date_of_death: mortalityRecord.date_of_death,
      approximate_age: mortalityRecord.approximate_age,
      severity: 'high',
      status: mortalityRecord.status || 'New',
      image_url: mortalityRecord.photo_url || mortalityRecord.image_url,
      notes: mortalityRecord.notes,
      created_at: mortalityRecord.created_at,
      updated_at: mortalityRecord.updated_at,
      status_history: [
        {
          from_status: null,
          to_status: mortalityRecord.status || 'New',
          timestamp: mortalityRecord.created_at,
          updated_by: 'Farmer (Self Report)',
          notes: `Animal mortality reported. Suspected cause: ${mortalityRecord.suspected_cause}`,
        },
      ],
    };

    // Prepend or update
    const idx = diagnoses.findIndex((d) => d.id === unifiedCase.id || d.case_id === unifiedCase.id);
    if (idx >= 0) {
      diagnoses[idx] = { ...diagnoses[idx], ...unifiedCase };
    } else {
      diagnoses.unshift(unifiedCase);
    }

    fs.writeFileSync(LOCAL_DIAGNOSES_FILE, JSON.stringify(diagnoses, null, 2));
  } catch (err) {
    console.warn('[mortalityController] Failed to sync mortality record to diagnosis_cases.json:', err.message);
  }
}

/**
 * POST /api/mortality
 * Create a new animal mortality report
 */
const createMortalityReport = asyncHandler(async (req, res) => {
  const {
    species,
    approximate_age,
    date_of_death,
    suspected_cause,
    location,
    notes,
    farmer_id,
    farmer_name,
    farmer_phone,
    farm_id,
    village,
    taluka,
    district,
    latitude,
    longitude,
  } = req.body;

  if (!species) {
    throw new ApiError(400, 'Species is required (e.g. cattle, buffalo, goat, sheep, poultry).');
  }
  if (!suspected_cause) {
    throw new ApiError(400, 'Suspected cause of death is required.');
  }

  const reportId = `mort-${uuidv4()}`;
  const now = new Date().toISOString();

  // Photo uploaded via multer or base64 URL
  let photoUrl = null;
  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.photo_url) {
    photoUrl = req.body.photo_url;
  } else if (req.body.image_url) {
    photoUrl = req.body.image_url;
  }

  const cleanVillage = village || (location ? location.split(',')[0].trim() : 'Niphad');
  const cleanTaluka = taluka || (location && location.includes(',') ? location.split(',')[1].trim() : 'Niphad');
  const cleanDistrict = district || 'Nashik';
  const cleanLat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude || '20.085'));
  const cleanLng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude || '74.110'));

  const mortalityRecord = {
    id: reportId,
    report_type: 'mortality',
    species: species.toLowerCase(),
    approximate_age: approximate_age || 'Adult',
    date_of_death: date_of_death || new Date().toISOString().split('T')[0],
    suspected_cause,
    location: location || `${cleanVillage}, ${cleanTaluka}, ${cleanDistrict}`,
    village: cleanVillage,
    taluka: cleanTaluka,
    district: cleanDistrict,
    latitude: cleanLat,
    longitude: cleanLng,
    notes: notes || '',
    photo_url: photoUrl,
    image_url: photoUrl,
    farmer_id: farmer_id || 'farmer123',
    farmer_name: farmer_name || 'Livestock Owner',
    farmer_phone: farmer_phone || '+91 98200 00000',
    farm_id: farm_id || 'farm-demo-001',
    status: 'New',
    created_at: now,
    updated_at: now,
  };

  // 1. Save to local mortality_reports.json
  const reports = getLocalMortalityReports();
  reports.unshift(mortalityRecord);
  saveLocalMortalityReports(reports);

  // 2. Synchronize to unified cases feed
  syncToDiagnosisCases(mortalityRecord);

  // 3. Attempt Supabase persistence
  try {
    await supabase.from('mortality_reports').insert({
      id: reportId,
      species: mortalityRecord.species,
      approximate_age: mortalityRecord.approximate_age,
      date_of_death: mortalityRecord.date_of_death,
      suspected_cause: mortalityRecord.suspected_cause,
      farmer_id: mortalityRecord.farmer_id,
      village: cleanVillage,
      taluka: cleanTaluka,
      district: cleanDistrict,
      latitude: cleanLat,
      longitude: cleanLng,
      notes: mortalityRecord.notes,
      photo_url: photoUrl,
      status: 'New',
      created_at: now,
    });
  } catch (err) {
    // Non-blocking in fallback mode
  }

  res.status(201).json({
    success: true,
    data: mortalityRecord,
    message: 'Animal death report successfully filed and dispatched to regional Veterinary Officer.',
  });
});

/**
 * GET /api/mortality
 * Retrieve all mortality reports with optional filters
 */
const getAllMortalityReports = asyncHandler(async (req, res) => {
  const { species, district, taluka, suspected_cause, status } = req.query;

  let reports = getLocalMortalityReports();

  if (species && species !== 'all') {
    reports = reports.filter((r) => r.species && r.species.toLowerCase() === species.toLowerCase());
  }
  if (district) {
    reports = reports.filter((r) => r.district && r.district.toLowerCase().includes(district.toLowerCase()));
  }
  if (taluka) {
    reports = reports.filter((r) => r.taluka && r.taluka.toLowerCase().includes(taluka.toLowerCase()));
  }
  if (suspected_cause) {
    reports = reports.filter(
      (r) => r.suspected_cause && r.suspected_cause.toLowerCase().includes(suspected_cause.toLowerCase())
    );
  }
  if (status && status !== 'all') {
    reports = reports.filter((r) => (r.status || 'New').toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    data: reports,
    count: reports.length,
  });
});

/**
 * GET /api/mortality/:id
 * Retrieve specific mortality report by ID
 */
const getMortalityReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reports = getLocalMortalityReports();
  const found = reports.find((r) => r.id === id);

  if (!found) {
    throw new ApiError(404, 'Mortality report record not found.');
  }

  res.json({
    success: true,
    data: found,
  });
});

module.exports = {
  createMortalityReport,
  getAllMortalityReports,
  getMortalityReportById,
  getLocalMortalityReports,
};
