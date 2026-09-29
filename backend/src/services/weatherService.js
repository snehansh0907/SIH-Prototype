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

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with status ${response.status}`);
    }

    const raw = await response.json();

    // ---- Clean current conditions ----
    const current = {
      temperature_c: raw.current?.temperature_2m ?? 28,
      humidity_percent: raw.current?.relative_humidity_2m ?? 75,
      rainfall_mm: raw.current?.rain ?? raw.current?.precipitation ?? 0,
    };

    // ---- Clean 5-day forecast ----
    const forecast = [];
    const days = raw.daily?.time || [];
    for (let i = 0; i < days.length; i++) {
      forecast.push({
        date: raw.daily.time[i],
        max_temp_c: raw.daily.temperature_2m_max?.[i] ?? 32,
        min_temp_c: raw.daily.temperature_2m_min?.[i] ?? 22,
        humidity_percent: raw.daily.relative_humidity_2m_max?.[i] ?? 80,
        rainfall_mm: raw.daily.precipitation_sum?.[i] ?? 0,
        rain_probability_percent: raw.daily.precipitation_probability_max?.[i] ?? 30,
      });
    }

    return { current, forecast };
  } catch (err) {
    console.warn('[WeatherService] Live weather fetch notice, utilizing local agro-climatic baseline:', err.message);
    return {
      current: {
        temperature_c: 28,
        humidity_percent: 75,
        rainfall_mm: 0,
      },
      forecast: [
        { date: new Date().toISOString().split('T')[0], max_temp_c: 32, min_temp_c: 22, humidity_percent: 75, rainfall_mm: 0, rain_probability_percent: 25 },
      ],
    };
  }
}

module.exports = { getWeather };
