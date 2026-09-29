// =========================================================
// Pashu Sarthak - Livestock Herd & Shed Controller
// =========================================================
// Handles Livestock Owner Herd / Shed CRUD + Animal Units CRUD
// (with full backward compatibility for farm / crop-cycle routes).
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
  const farmerId = base.farmerId || base.farmer_id || base.ownerId || base.owner_id;
  const phone = base.phone || base.phone_number || base.mobile || '';
  const farmId = base.shedId || base.shed_id || base.farmId || base.farm_id || (id ? `shed-${id}` : undefined);
  const shedName = base.shedName || base.shed_name || base.farmName || base.farm_name || (base.name ? `${base.name.split(' ')[0]}'s Dairy Shed` : 'My Livestock Shed');
  const species = base.species || base.monitoredAnimal || base.monitoredCrop || 'Cattle';
  const breed = base.breed || 'Gir';
  const totalAnimals = typeof base.totalAnimals === 'number' ? base.totalAnimals : parseInt(String(base.totalAnimals || base.herdSize || '6'), 10) || 6;
  const ageRange = base.ageRange || base.age_range || 'Adults and Calves';
  const vaccinationHistory = base.vaccinationHistory || base.vaccination_history || ['LSD Goat Pox 2026', 'FMD NADCP 2026'];
  const areaAcres = typeof base.areaAcres === 'number' ? base.areaAcres : parseFloat(String(base.areaAcres || base.area_acres || '2.5')) || 2.5;

  return {
    ...base,
    id,
    farmerId,
    ownerId: farmerId,
    phone: String(phone),
    farmId,
    shedId: farmId,
    farmName: shedName,
    shedName,
    species,
    breed,
    totalAnimals,
    total_animals: totalAnimals,
    ageRange,
    age_range: ageRange,
    vaccinationHistory,
    vaccination_history: vaccinationHistory,
    areaAcres,
    area_acres: areaAcres,
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

// ---------------------- HERDS / FARMS ----------------------

/**
 * POST /api/farms or /api/herds
 */
const createFarm = asyncHandler(async (req, res) => {
  const {
    farmer_id,
    owner_id,
    farm_name,
    shed_name,
    species = 'Cattle',
    breed = 'Gir',
    total_animals = 6,
    age_range = 'Adults and Calves',
    vaccination_history = ['LSD Goat Pox 2026', 'FMD NADCP 2026'],
    latitude,
    longitude,
    village,
    taluka,
    district,
    area_acres,
  } = req.body;

  const resolvedOwnerId = owner_id || farmer_id;
  const resolvedName = (shed_name || farm_name || '').trim();

  if (!resolvedOwnerId || !resolvedName || latitude === undefined || longitude === undefined) {
    throw new ApiError(400, 'owner_id, shed_name, latitude, and longitude are required.');
  }

  const newHerd = {
    id: uuidv4(),
    owner_id: resolvedOwnerId,
    farmer_id: resolvedOwnerId,
    shed_name: resolvedName,
    farm_name: resolvedName,
    species,
    breed,
    total_animals: parseInt(String(total_animals), 10) || 6,
    age_range,
    vaccination_history,
    latitude,
    longitude,
    village: village || null,
    taluka: taluka || null,
    district: district || null,
    area_acres: area_acres || null,
  };

  let data = null;
  let error = null;

  try {
    const supaRes = await supabase.from('herds').insert(newHerd).select().single();
    data = supaRes.data;
    error = supaRes.error;
  } catch {
    const supaRes = await supabase.from('farms').insert({
      id: newHerd.id,
      farmer_id: resolvedOwnerId,
      farm_name: resolvedName,
      latitude,
      longitude,
      village: village || null,
      taluka: taluka || null,
      district: district || null,
      area_acres: area_acres || null,
    }).select().single();
    data = supaRes.data;
    error = supaRes.error;
  }

  if (error && !data) throw new ApiError(500, `Failed to create herd: ${error.message}`);

  res.status(201).json({ success: true, data: data || newHerd });
});

/**
 * GET /api/farms/:id or /api/herds/:id
 */
const getFarmById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let farm = null;
  try {
    const { data } = await supabase.from('herds').select('*').eq('id', id).single();
    if (data) farm = data;
  } catch {}

  if (!farm) {
    try {
      const { data } = await supabase.from('farms').select('*').eq('id', id).single();
      if (data) farm = data;
    } catch {}
  }

  if (!farm) {
    const localUsers = readLocalUsers();
    const matchedUser = localUsers.find((u) => u.farmId === id || u.shedId === id || `shed-${u.id}` === id || `farm-${u.id}` === id || u.id === id);
    if (matchedUser && (matchedUser.shedName || matchedUser.farmName)) {
      farm = {
        id: matchedUser.shedId || matchedUser.farmId || `shed-${matchedUser.id}`,
        owner_id: matchedUser.id,
        farmer_id: matchedUser.id,
        shed_name: matchedUser.shedName || matchedUser.farmName,
        farm_name: matchedUser.shedName || matchedUser.farmName,
        species: matchedUser.species || 'Cattle',
        breed: matchedUser.breed || 'Gir',
        total_animals: matchedUser.totalAnimals || 6,
        age_range: matchedUser.ageRange || 'Adults and Calves',
        vaccination_history: matchedUser.vaccinationHistory || ['LSD Goat Pox 2026', 'FMD NADCP 2026'],
        latitude: matchedUser.latitude ?? 20.085,
        longitude: matchedUser.longitude ?? 74.11,
        village: matchedUser.village,
        taluka: matchedUser.taluka,
        district: matchedUser.district,
        area_acres: matchedUser.areaAcres ?? 2.5,
      };
    }
  }

  if (!farm) throw new ApiError(404, 'Livestock shed / herd not found.');

  res.json({ success: true, data: farm });
});

/**
 * GET /api/farms/farmer/:farmerId or /api/herds/owner/:ownerId
 */
const getFarmsByFarmer = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  let farms = [];
  try {
    const { data } = await supabase.from('herds').select('*').or(`owner_id.eq.${farmerId},farmer_id.eq.${farmerId}`);
    if (Array.isArray(data) && data.length > 0) farms = data;
  } catch {}

  if (farms.length === 0) {
    try {
      const { data } = await supabase.from('farms').select('*').eq('farmer_id', farmerId);
      if (Array.isArray(data) && data.length > 0) farms = data;
    } catch {}
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
      if (u.ownerId === cleanFarmerId || (u.ownerId && u.ownerId.toLowerCase() === cleanLower)) return true;
      if (idLast10.length === 10) {
        const uPhoneLast10 = String(u.phone || '').replace(/\D/g, '').slice(-10);
        if (uPhoneLast10 && uPhoneLast10 === idLast10) return true;
      }
      return false;
    });

    if (matchedUser && (matchedUser.shedName || matchedUser.farmName)) {
      farms = [
        {
          id: matchedUser.shedId || matchedUser.farmId || `shed-${matchedUser.id}`,
          owner_id: matchedUser.id,
          farmer_id: matchedUser.id,
          shed_name: matchedUser.shedName || matchedUser.farmName,
          farm_name: matchedUser.shedName || matchedUser.farmName,
          species: matchedUser.species || 'Cattle',
          breed: matchedUser.breed || 'Gir',
          total_animals: matchedUser.totalAnimals || 6,
          age_range: matchedUser.ageRange || 'Adults and Calves',
          vaccination_history: matchedUser.vaccinationHistory || ['LSD Goat Pox 2026', 'FMD NADCP 2026'],
          latitude: matchedUser.latitude ?? 20.085,
          longitude: matchedUser.longitude ?? 74.11,
          village: matchedUser.village,
          taluka: matchedUser.taluka,
          district: matchedUser.district,
          area_acres: matchedUser.areaAcres ?? 2.5,
        },
      ];
    }
  }

  res.json({ success: true, data: farms });
});

/**
 * PUT /api/farms/:id or /api/herds/:id
 */
const updateFarm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  delete updates.created_at;

  let data = null;
  try {
    const resH = await supabase.from('herds').update(updates).eq('id', id).select().single();
    if (resH.data) data = resH.data;
  } catch {}

  if (!data) {
    try {
      const resF = await supabase.from('farms').update(updates).eq('id', id).select().single();
      if (resF.data) data = resF.data;
    } catch {}
  }

  if (!data) {
    // Return updated fields for local fallback
    data = { id, ...updates, updated_at: new Date().toISOString() };
  }

  res.json({ success: true, data });
});

// ---------------------- ANIMAL UNITS / CROP CYCLES ----------------------

/**
 * POST /api/crop-cycles or /api/animal-units
 */
const createCropCycle = asyncHandler(async (req, res) => {
  const { farm_id, herd_id, crop_name, species, variety, breed, tag_number, status } = req.body;
  const resolvedHerdId = herd_id || farm_id;
  const resolvedSpecies = species || crop_name;

  if (!resolvedHerdId || !resolvedSpecies) {
    throw new ApiError(400, 'herd_id and species are required.');
  }

  const newUnit = {
    id: uuidv4(),
    herd_id: resolvedHerdId,
    farm_id: resolvedHerdId,
    species: resolvedSpecies,
    crop_name: resolvedSpecies,
    breed: breed || variety || 'Selected',
    variety: breed || variety || 'Selected',
    tag_number: tag_number || null,
    status: status || 'active',
  };

  let data = null;
  try {
    const resU = await supabase.from('animal_units').insert(newUnit).select().single();
    if (resU.data) data = resU.data;
  } catch {
    const resC = await supabase.from('crop_cycles').insert(newUnit).select().single();
    if (resC.data) data = resC.data;
  }

  res.status(201).json({ success: true, data: data || newUnit });
});

/**
 * GET /api/crop-cycles/farm/:farmId or /api/animal-units/herd/:herdId
 */
const getCropCyclesByFarm = asyncHandler(async (req, res) => {
  const { farmId } = req.params;

  let cycles = [];
  try {
    const { data } = await supabase
      .from('animal_units')
      .select('*')
      .or(`herd_id.eq.${farmId},farm_id.eq.${farmId}`)
      .order('created_at', { ascending: false });

    if (Array.isArray(data) && data.length > 0) cycles = data;
  } catch {}

  if (cycles.length === 0) {
    try {
      const { data } = await supabase
        .from('crop_cycles')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });

      if (Array.isArray(data) && data.length > 0) cycles = data;
    } catch {}
  }

  if (cycles.length === 0) {
    const localUsers = readLocalUsers();
    const matchedUser = localUsers.find((u) => u.farmId === farmId || u.shedId === farmId || u.id === farmId);
    if (matchedUser) {
      cycles = [
        {
          id: matchedUser.cropCycleId || `unit-${matchedUser.id}`,
          herd_id: farmId,
          farm_id: farmId,
          species: matchedUser.species || 'Cattle',
          crop_name: matchedUser.species || 'Cattle',
          breed: matchedUser.breed || 'Gir',
          variety: matchedUser.breed || 'Gir',
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

  let data = null;
  try {
    const resU = await supabase.from('animal_units').update(updates).eq('id', id).select().single();
    if (resU.data) data = resU.data;
  } catch {}

  if (!data) {
    try {
      const resC = await supabase.from('crop_cycles').update(updates).eq('id', id).select().single();
      if (resC.data) data = resC.data;
    } catch {}
  }

  if (!data) {
    data = { id, ...updates, updated_at: new Date().toISOString() };
  }

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
