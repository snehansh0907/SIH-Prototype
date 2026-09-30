// =========================================================
// Pashu Sarthak - Location Service (Backend SIH26128)
// =========================================================
// Handles reverse-geocoding coordinates (lat, lng) to
// Indian administrative hierarchy (State, District, Taluka, Village)
// using free and reliable geocoding providers.
// =========================================================

const fetch = globalThis.fetch || require('node-fetch');

// Clean administrative words like " Taluka", " District", " Tehsil"
function cleanAdminName(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/\b(Taluka|Tehsil|Tahsil|Sub-District|Subdistrict|District|Division|Block)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Reverse geocode coordinates to extract State, District, Taluka, Village, Pincode
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} location details
 */
async function reverseGeocode(latitude, longitude) {
  if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Valid latitude and longitude are required.');
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  let rawState = '';
  let rawDistrict = '';
  let rawTaluka = '';
  let rawVillage = '';
  let rawPincode = '';

  // 1. Primary Provider: OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'PashuSarthak/1.0 (SIH 2026 Livestock Surveillance Prototype; contact@pashusarthak.in)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      rawState = addr.state || '';
      rawDistrict = addr.state_district || addr.district || addr.county || '';
      rawTaluka = addr.county || addr.subdistrict || addr.tehsil || addr.taluk || addr.suburb || '';
      rawVillage =
        addr.village ||
        addr.town ||
        addr.city ||
        addr.suburb ||
        addr.hamlet ||
        addr.neighbourhood ||
        addr.residential ||
        addr.locality ||
        '';
      rawPincode = addr.postcode || '';
    }
  } catch (err) {
    console.warn('[locationService] Nominatim reverse-geocode warning:', err.message);
  }

  // 2. Secondary Provider: BigDataCloud
  if (!rawState || !rawDistrict) {
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl, { signal: AbortSignal.timeout(6000) });
      if (bdcRes.ok) {
        const data = await bdcRes.json();
        if (!rawState) rawState = data.principalSubdivision || '';
        const adminList = data.localityInfo?.administrative || [];

        if (!rawDistrict) {
          const distObj = adminList.find(
            (a) => /district/i.test(a.name) || (a.adminLevel === 5 && a.name !== rawState)
          );
          if (distObj) rawDistrict = distObj.name;
        }

        if (!rawTaluka) {
          const talObj = adminList.find(
            (a) =>
              /taluk|tehsil|subdistrict/i.test(a.name) ||
              (a.adminLevel === 6 && a.name !== rawDistrict && a.name !== rawState)
          );
          if (talObj) rawTaluka = talObj.name;
        }

        if (!rawVillage) rawVillage = data.locality || data.city || '';
        if (!rawPincode) rawPincode = data.postcode || '';
      }
    } catch (err) {
      console.warn('[locationService] BigDataCloud reverse-geocode warning:', err.message);
    }
  }

  // 3. Tertiary Provider: Photon (Komoot OSM)
  if (!rawState || !rawDistrict) {
    try {
      const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
      const pRes = await fetch(photonUrl, { signal: AbortSignal.timeout(5000) });
      if (pRes.ok) {
        const pData = await pRes.json();
        const props = pData.features?.[0]?.properties || {};
        if (!rawState && props.state) rawState = props.state;
        if (!rawDistrict && (props.district || props.county)) rawDistrict = props.district || props.county;
        if (!rawTaluka && (props.county || props.subdistrict)) rawTaluka = props.county || props.subdistrict;
        if (!rawVillage && (props.name || props.city || props.town)) rawVillage = props.name || props.city || props.town;
        if (!rawPincode && props.postcode) rawPincode = props.postcode;
      }
    } catch (err) {
      console.warn('[locationService] Photon reverse-geocode warning:', err.message);
    }
  }

  const cleanedState = rawState.trim();
  const cleanedDistrict = cleanAdminName(rawDistrict);
  const cleanedTaluka = cleanAdminName(rawTaluka) || cleanAdminName(rawDistrict) || '';
  const cleanedVillage = cleanAdminName(rawVillage) || cleanedTaluka || cleanedDistrict || '';
  const pincode = rawPincode.replace(/\D/g, '').slice(0, 6);

  const parts = [cleanedVillage, cleanedTaluka, cleanedDistrict, cleanedState]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
  const formattedAddress = parts.join(', ') + (pincode ? ` - ${pincode}` : '');

  return {
    state: cleanedState,
    district: cleanedDistrict,
    taluka: cleanedTaluka,
    village: cleanedVillage,
    pincode,
    formattedAddress,
    latitude: lat,
    longitude: lon,
  };
}

module.exports = {
  reverseGeocode,
  cleanAdminName,
};
