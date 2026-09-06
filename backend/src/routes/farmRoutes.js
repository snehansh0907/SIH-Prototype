// =========================================================
// Farm + Crop Cycle Routes
// =========================================================
// Two separate routers are exported from this single file
// (per the required project structure) and mounted at
// different base paths in app.js:
//   farmRouter       -> /api/farms
//   cropCycleRouter   -> /api/crop-cycles
// =========================================================

const express = require('express');
const farmRouter = express.Router();
const cropCycleRouter = express.Router();

const {
  createFarm,
  getFarmById,
  getFarmsByFarmer,
  updateFarm,
  createCropCycle,
  getCropCyclesByFarm,
  updateCropCycle,
} = require('../controllers/farmController');

// ---------------- Farms ----------------
farmRouter.post('/', createFarm);
farmRouter.get('/farmer/:farmerId', getFarmsByFarmer);
farmRouter.get('/:id', getFarmById);
farmRouter.put('/:id', updateFarm);

// ---------------- Crop Cycles ----------------
cropCycleRouter.post('/', createCropCycle);
cropCycleRouter.get('/farm/:farmId', getCropCyclesByFarm);
cropCycleRouter.put('/:id', updateCropCycle);

module.exports = { farmRouter, cropCycleRouter };
