// =========================================================
// Farm Controller
// =========================================================
// Handles Farm CRUD + Crop Cycle CRUD (kept in the same file
// since crop cycles always belong to a farm and the project
// structure groups them together).
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const REGISTERED_USERS_FILE = path.resolve(__dirname, '../data/registered_users.json');

function normalizeFarmUser(u) {
  if (!u) return null;
  const base = u.user && typeof u.user === 'object' ? u.user : u;
  const id = base.id || base.user_id || base.userId;
  const farmerId = base.farmerId || base.farmer_id;
  const phone = base.phone || base.phone_number || base.mobile || '';
  const farmId = base.farmId || base.farm_id || (id ? `farm-${id}` : undefined);
  const farmName = base.farmName || base.farm_name || (base.name ? `${base.name.split(' ')[0]}'s Farm` : 'My Farm');
  const areaAcres = typeof base.areaAcres === 'number' ? base.areaAcres : parseFloat(String(base.areaAcres || base.area_acres || '2.5')) || 2.5;

  return {
    ...base,
    id,
    farmerId,
    phone: String(phone),
    farmId,
    farmName,
    areaAcres,
  };
}

function readLocalUsers() {
  try {
    if (!fs.existsSync(REGISTERED_USERS_FILE)) return [];
    const data = fs.readFileSync(REGISTERED_USERS_FILE, 'utf8');
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeFarmUser).filter(Boolean);
  } catch {
    return [];
  }
}

// ---------------------- FARMS ----------------------

/**
 * POST /api/farms
 */
const createFarm = asyncHandler(async (req, res) => {
  const { farmer_id, farm_name, latitude, longitude, village, taluka, district, area_acres } = req.body;

  if (!farmer_id || !farm_name || latitude === undefined || longitude === undefined) {
    throw new ApiError(400, 'farmer_id, farm_name, latitude, and longitude are required.');
  }

  const newFarm = {
    id: uuidv4(),
    farmer_id,
    farm_name,
    latitude,
    longitude,
    village: village || null,
    taluka: taluka || null,
    district: district || null,
    area_acres: area_acres || null,
  };

  const { data, error } = await supabase.from('farms').insert(newFarm).select().single();
  if (error) throw new ApiError(500, `Failed to create farm: ${error.message}`);

  res.status(201).json({ success: true, data });
});

/**
 * GET /api/farms/:id
 */
const getFarmById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let farm = null;
  try {
    const { data, error } = await supabase.from('farms').select('*').eq('id', id).single();
    if (!error && data) farm = data;
  } catch {}

  if (!farm) {
    const localUsers = readLocalUsers();
    const matchedUser = localUsers.find((u) => u.farmId === id || `farm-${u.id}` === id || u.id === id);
    if (matchedUser && matchedUser.farmName) {
      farm = {
        id: matchedUser.farmId || `farm-${matchedUser.id}`,
        farmer_id: matchedUser.id,
        farm_name: matchedUser.farmName,
        latitude: matchedUser.latitude ?? 20.085,
        longitude: matchedUser.longitude ?? 74.11,
        village: matchedUser.village,
        taluka: matchedUser.taluka,
        district: matchedUser.district,
        area_acres:
          typeof matchedUser.areaAcres === 'number'
            ? matchedUser.areaAcres
            : parseFloat(String(matchedUser.areaAcres || '2.5')),
      };
    }
  }

  if (!farm) throw new ApiError(404, 'Farm not found.');

  res.json({ success: true, data: farm });
});

/**
 * GET /api/farms/farmer/:farmerId
 */
const getFarmsByFarmer = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  let farms = [];
  try {
    const { data, error } = await supabase.from('farms').select('*').eq('farmer_id', farmerId);
    if (!error && Array.isArray(data) && data.length > 0) {
      farms = data;
    }
  } catch (err) {
    console.warn('[farmController] Supabase farm query error:', err.message);
  }

  if (farms.length === 0) {
    const localUsers = readLocalUsers();
    const cleanFarmerId = (farmerId || '').trim();
    const cleanLower = cleanFarmerId.toLowerCase();
    const idLast10 = cleanFarmerId.replace(/\D/g, '').slice(-10);

    const matchedUser = localUsers.find((u) => {
      if (!u) return false;
      if (u.id === cleanFarmerId || (u.id && u.id.toLowerCase() === cleanLower)) return true;
      if (u.farmerId === cleanFarmerId || (u.farmerId && u.farmerId.toLowerCase() === cleanLower)) return true;
      if (u.farmer_id && u.farmer_id.toLowerCase() === cleanLower) return true;
      if (idLast10.length === 10) {
        const uPhoneLast10 = String(u.phone || '').replace(/\D/g, '').slice(-10);
        if (uPhoneLast10 && uPhoneLast10 === idLast10) return true;
      }
      return false;
    });
    if (matchedUser && matchedUser.farmName) {
      farms = [
        {
          id: matchedUser.farmId || `farm-${matchedUser.id}`,
          farmer_id: matchedUser.id,
          farm_name: matchedUser.farmName,
          latitude: matchedUser.latitude ?? 20.085,
          longitude: matchedUser.longitude ?? 74.11,
          village: matchedUser.village,
          taluka: matchedUser.taluka,
          district: matchedUser.district,
          area_acres:
            typeof matchedUser.areaAcres === 'number'
              ? matchedUser.areaAcres
              : parseFloat(String(matchedUser.areaAcres || '2.5')),
        },
      ];
    }
  }

  res.json({ success: true, data: farms });
});

/**
 * PUT /api/farms/:id
 */
const updateFarm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await supabase.from('farms').update(updates).eq('id', id).select().single();
  if (error || !data) throw new ApiError(404, 'Farm not found or update failed.');

  res.json({ success: true, data });
});

// ---------------------- CROP CYCLES ----------------------

/**
 * POST /api/crop-cycles
 */
const createCropCycle = asyncHandler(async (req, res) => {
  const { farm_id, crop_name, variety, sowing_date, crop_stage, status } = req.body;

  if (!farm_id || !crop_name) {
    throw new ApiError(400, 'farm_id and crop_name are required.');
  }

  const newCycle = {
    id: uuidv4(),
    farm_id,
    crop_name,
    variety: variety || null,
    sowing_date: sowing_date || null,
    crop_stage: crop_stage || 'vegetative',
    status: status || 'active',
  };

  const { data, error } = await supabase.from('crop_cycles').insert(newCycle).select().single();
  if (error) throw new ApiError(500, `Failed to create crop cycle: ${error.message}`);

  res.status(201).json({ success: true, data });
});

/**
 * GET /api/crop-cycles/farm/:farmId
 */
const getCropCyclesByFarm = asyncHandler(async (req, res) => {
  const { farmId } = req.params;

  let cycles = [];
  try {
    const { data, error } = await supabase
      .from('crop_cycles')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      cycles = data;
    }
  } catch (err) {
    console.warn('[farmController] Supabase crop cycles query error:', err.message);
  }

  if (cycles.length === 0) {
    const localUsers = readLocalUsers();
    const matchedUser = localUsers.find((u) => u.farmId === farmId || u.id === farmId);
    if (matchedUser && matchedUser.monitoredCrop) {
      cycles = [
        {
          id: matchedUser.cropCycleId || `cycle-${matchedUser.id}`,
          farm_id: farmId,
          crop_name: matchedUser.monitoredCrop,
          variety: 'Selected',
          crop_stage: 'vegetative',
          status: 'active',
        },
      ];
    }
  }

  res.json({ success: true, data: cycles });
});

/**
 * PUT /api/crop-cycles/:id
 */
const updateCropCycle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await supabase
    .from('crop_cycles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw new ApiError(404, 'Crop cycle not found or update failed.');

  res.json({ success: true, data });
});

module.exports = {
  createFarm,
  getFarmById,
  getFarmsByFarmer,
  updateFarm,
  createCropCycle,
  getCropCyclesByFarm,
  updateCropCycle,
};
