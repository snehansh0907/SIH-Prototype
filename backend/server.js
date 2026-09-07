// =========================================================
// Krishi Sarthak Backend - Server Entry Point
// =========================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Server Warning] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server Error] Uncaught Exception:', err);
});

app.listen(PORT, () => {
  console.log('=========================================');
  console.log('  Krishi Sarthak API');
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
});

