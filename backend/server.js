// =========================================================
// Krishi Sarthak Backend - Server Entry Point
// =========================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./src/app');

const initialPort = parseInt(process.env.PORT || '5001', 10);

function startServer(port) {
  const server = app.listen(port, () => {
    console.log('=========================================');
    console.log('  Krishi Sarthak API');
    console.log(`  Running on http://localhost:${port}`);
    console.log(`  Health check: http://localhost:${port}/api/health`);
    console.log('=========================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < initialPort + 5) {
      console.warn(`[Server Notice] Port ${port} is in use (e.g. macOS AirPlay Receiver). Attempting port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[Server Error]:', err);
    }
  });
}

startServer(initialPort);

