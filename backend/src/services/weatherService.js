// =========================================================
// Weather Service (Open-Meteo)
// =========================================================
// Fetches current + short-term forecast weather data from the
// free Open-Meteo API and returns a clean, frontend-friendly
// shape. Raw Open-Meteo response fields are NOT passed through
// directly - only what the app actually needs.
// =========================================================

const fetch = globalThis.fetch || require('node-fetch');
try {
  require('dotenv').config();
} catch {}

const BASE_URL = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com';

/**
 * Fetch current + 5-day weather data for a given location.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} clean weather summary
 */
async function getWeather(latitude, longitude) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('latitude and longitude are required to fetch weather.');
  }

  const url =
    `${BASE_URL}/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,rain` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,relative_humidity_2m_max` +
    `&forecast_days=5` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const raw = await response.json();

  // ---- Clean current conditions ----
  const current = {
    temperature_c: raw.current?.temperature_2m ?? null,
    humidity_percent: raw.current?.relative_humidity_2m ?? null,
    rainfall_mm: raw.current?.rain ?? raw.current?.precipitation ?? 0,
  };

  // ---- Clean 5-day forecast ----
  const forecast = [];
  const days = raw.daily?.time || [];
  for (let i = 0; i < days.length; i++) {
    forecast.push({
      date: raw.daily.time[i],
      max_temp_c: raw.daily.temperature_2m_max?.[i] ?? null,
      min_temp_c: raw.daily.temperature_2m_min?.[i] ?? null,
      humidity_percent: raw.daily.relative_humidity_2m_max?.[i] ?? null,
      rainfall_mm: raw.daily.precipitation_sum?.[i] ?? 0,
      rain_probability_percent: raw.daily.precipitation_probability_max?.[i] ?? 0,
    });
  }

  return { current, forecast };
}

module.exports = { getWeather };
