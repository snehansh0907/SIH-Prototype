// =========================================================
// Hotspot Service
// =========================================================
// - Haversine distance calculation
// - findNearbyCases(): confirmed disease cases within a radius
// - getHotspots(): confirmed + suspected cases for the map,
//   with optional filters (disease, crop, taluka)
//
// Private farmer information (name, phone, farmer_id) is
// intentionally NEVER returned from this service.
// =========================================================

const supabase = require('../config/supabase');

const EARTH_RADIUS_KM = 6371;
const DEFAULT_RADIUS_KM = 10;
const NEARBY_CASES_LOOKBACK_DAYS = 14;

/**
 * Haversine formula - great-circle distance between two lat/lng points in km.
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Find confirmed diagnosis cases within `radiusKm` of a given point.
 * Only cases from the last NEARBY_CASES_LOOKBACK_DAYS days are considered
 * "recent" and given full weight in risk calculations; older confirmed
 * cases are still returned but flagged as not recent.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusKm
 * @param {string} [excludeFarmId] - optional farm_id to exclude (a farm shouldn't count itself as "nearby")
 */
async function findNearbyCases(latitude, longitude, radiusKm = DEFAULT_RADIUS_KM, excludeFarmId = null) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('latitude and longitude are required to find nearby cases.');
  }

  const { data, error } = await supabase
    .from('diagnosis_cases')
    .select('id, farm_id, predicted_disease, severity_band, latitude, longitude, status, created_at')
    .in('status', ['confirmed', 'corrected']);

  if (error) throw new Error(`Failed to fetch cases for hotspot lookup: ${error.message}`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - NEARBY_CASES_LOOKBACK_DAYS);

  const nearby = (data || [])
    .filter((c) => c.latitude !== null && c.longitude !== null)
    .filter((c) => (excludeFarmId ? c.farm_id !== excludeFarmId : true))
    .map((c) => {
      const distanceKm = haversineDistanceKm(latitude, longitude, c.latitude, c.longitude);
      const isRecent = new Date(c.created_at) >= cutoffDate;
      return { ...c, distance_km: Math.round(distanceKm * 100) / 100, is_recent: isRecent };
    })
    .filter((c) => c.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);

  return nearby;
}

/**
 * Get hotspot data for the Leaflet heatmap on the frontend.
 * Returns confirmed and suspected cases separately, with only
 * the fields needed for mapping (no private farmer data).
 */
async function getHotspots({ disease, crop, taluka } = {}) {
  let query = supabase
    .from('diagnosis_cases')
    .select(
      `id, latitude, longitude, predicted_disease, status, created_at,
       farm:farm_id ( taluka, district ),
       crop_cycle:crop_cycle_id ( crop_name )`
    );

  if (disease) {
    query = query.ilike('predicted_disease', `%${disease}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch hotspots: ${error.message}`);

  let cases = (data || []).filter((c) => c.latitude !== null && c.longitude !== null);

  // Filter by crop (joined from crop_cycles)
  if (crop) {
    cases = cases.filter(
      (c) => c.crop_cycle?.crop_name && c.crop_cycle.crop_name.toLowerCase() === crop.toLowerCase()
    );
  }

  // Filter by taluka (joined from farms)
  if (taluka) {
    cases = cases.filter(
      (c) => c.farm?.taluka && c.farm.taluka.toLowerCase() === taluka.toLowerCase()
    );
  }

  const shapeCase = (c) => ({
    latitude: c.latitude,
    longitude: c.longitude,
    disease: c.predicted_disease,
    crop: c.crop_cycle?.crop_name || null,
    status: c.status,
    created_at: c.created_at,
  });

  const confirmed = cases.filter((c) => c.status === 'confirmed' || c.status === 'corrected').map(shapeCase);
  const suspected = cases
    .filter((c) => c.status === 'suspected' || c.status === 'expert_review_pending')
    .map(shapeCase);

  return { confirmed, suspected };
}

module.exports = {
  haversineDistanceKm,
  findNearbyCases,
  getHotspots,
  DEFAULT_RADIUS_KM,
  NEARBY_CASES_LOOKBACK_DAYS,
};
