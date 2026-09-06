// =========================================================
// Farm Controller
// =========================================================
// Handles Farm CRUD + Crop Cycle CRUD (kept in the same file
// since crop cycles always belong to a farm and the project
// structure groups them together).
// =========================================================

const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

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

  const { data, error } = await supabase.from('farms').select('*').eq('id', id).single();
  if (error || !data) throw new ApiError(404, 'Farm not found.');

  res.json({ success: true, data });
});

/**
 * GET /api/farms/farmer/:farmerId
 */
const getFarmsByFarmer = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  const { data, error } = await supabase.from('farms').select('*').eq('farmer_id', farmerId);
  if (error) throw new ApiError(500, `Failed to fetch farms: ${error.message}`);

  res.json({ success: true, data });
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

  const { data, error } = await supabase
    .from('crop_cycles')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, `Failed to fetch crop cycles: ${error.message}`);

  res.json({ success: true, data });
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
