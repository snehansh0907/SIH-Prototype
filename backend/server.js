// =========================================================
// Krishi Sarthak Backend - Server Entry Point
// =========================================================

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=========================================');
  console.log('  Krishi Sarthak API');
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
});
