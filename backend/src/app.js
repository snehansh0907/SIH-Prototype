// =========================================================
// Krishi Sarthak - Express App
// =========================================================
// Wires together middleware, routes, and error handling.
// =========================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const { getWeather } = require('./services/weatherService');

// Routes
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const { farmRouter, cropCycleRouter } = require('./routes/farmRoutes');
const riskRoutes = require('./routes/riskRoutes');
const hotspotRoutes = require('./routes/hotspotRoutes');
const expertRoutes = require('./routes/expertRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const advisoryRoutes = require('./routes/advisoryRoutes');

const app = express();

// ---------------- Global Middleware ----------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded crop images statically (e.g. http://localhost:5000/uploads/crop_123.jpg)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------------- Health Check ----------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Krishi Sarthak API is running' });
});

// ---------------- Weather ----------------
// GET /api/weather?lat=19.9975&lng=73.7898
app.get(
  '/api/weather',
  asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng query params are required.' });
    }
    const weather = await getWeather(parseFloat(lat), parseFloat(lng));
    res.json({ success: true, data: weather });
  })
);

// ---------------- Feature Routes ----------------
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/farms', farmRouter);
app.use('/api/crop-cycles', cropCycleRouter);
app.use('/api/risk', riskRoutes);
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/expert', expertRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/advisory', advisoryRoutes);

// ---------------- 404 Handler ----------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ---------------- Centralized Error Handler ----------------
app.use(errorHandler);

module.exports = app;
