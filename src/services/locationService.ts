import { ALL_INDIAN_STATES_AND_UTS } from '../data/indianStates';
import {
  normalizeStateName,
  normalizeDistrictName,
  findPincodeForVillage,
} from '../data/locations';
import { apiClient } from './apiClient';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  id: string;
  displayName: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface DetectedLocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  pincode?: string;
  formattedAddress?: string;
  errorMessage?: string;
}

// Optional API key configured via environment variable
const LOCATION_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_LOCATION_API_KEY) || '';

/**
 * Map browser Geolocation errors to farmer-friendly messages
 */
export function formatGeolocationError(error: GeolocationPositionError | any): Error {
  if (!error) {
    return new Error('Unable to detect your location. Please try again or select your location manually.');
  }

  const code = typeof error.code === 'number' ? error.code : 0;
  switch (code) {
    case 1: // PERMISSION_DENIED
      return new Error('Location permission was denied. Please allow location access or select your location manually.');
    case 2: // POSITION_UNAVAILABLE
      return new Error('Unable to determine your location. Please try again or select your location manually.');
    case 3: // TIMEOUT
      return new Error('Location request timed out. Please try again.');
    default:
      return new Error(error.message || 'Unable to detect your location. Please try again or select your location manually.');
  }
}

// Clean administrative words like " Taluka", " District", " Tehsil"
export function cleanAdminName(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/\b(Taluka|Tehsil|Tahsil|Sub-District|Subdistrict|District|Division|Block|Sub-Division|Mandal)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Find closest matching official state name
export function matchOfficialState(rawState?: string): string {
  if (!rawState) return '';
  const clean = rawState.trim().toLowerCase();
  const found = ALL_INDIAN_STATES_AND_UTS.find(
    (s) =>
      s.name.toLowerCase() === clean ||
      clean.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(clean)
  );
  return found ? found.name : rawState.trim();
}

// Offline fallback suggestions for key agricultural and Indian hubs
export const OFFLINE_AGRICULTURAL_HUBS: LocationSearchResult[] = [
  {
    id: 'hub_niphad',
    displayName: 'Niphad, Nashik, Maharashtra - 422303',
    village: 'Niphad',
    taluka: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    pincode: '422303',
    latitude: 20.0797,
    longitude: 74.1071,
  },
  {
    id: 'hub_pimpalgaon',
    displayName: 'Pimpalgaon Baswant, Niphad, Nashik, Maharashtra - 422209',
    village: 'Pimpalgaon Baswant',
    taluka: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    pincode: '422209',
    latitude: 20.1741,
    longitude: 73.9876,
  },
  {
    id: 'hub_chandori',
    displayName: 'Chandori, Niphad, Nashik, Maharashtra - 422201',
    village: 'Chandori',
    taluka: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    pincode: '422201',
    latitude: 20.0322,
    longitude: 74.0322,
  },
  {
    id: 'hub_nashik',
    displayName: 'Nashik, Maharashtra - 422001',
    village: 'Nashik',
    taluka: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    pincode: '422001',
    latitude: 19.9975,
    longitude: 73.7898,
  },
  {
    id: 'hub_pune',
    displayName: 'Pune, Maharashtra - 411001',
    village: 'Pune',
    taluka: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    latitude: 18.5204,
    longitude: 73.8567,
  },
  {
    id: 'hub_baramati',
    displayName: 'Baramati, Pune, Maharashtra - 413102',
    village: 'Baramati',
    taluka: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '413102',
    latitude: 18.1517,
    longitude: 74.5772,
  },
  {
    id: 'hub_nagpur',
    displayName: 'Nagpur, Maharashtra - 440001',
    village: 'Nagpur',
    taluka: 'Nagpur Rural',
    district: 'Nagpur',
    state: 'Maharashtra',
    pincode: '440001',
    latitude: 21.1458,
    longitude: 79.0882,
  },
  {
    id: 'hub_delhi',
    displayName: 'New Delhi, Delhi - 110001',
    village: 'New Delhi',
    taluka: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: 'hub_rampur',
    displayName: 'Rampur, Uttar Pradesh - 244901',
    village: 'Rampur',
    taluka: 'Rampur',
    district: 'Rampur',
    state: 'Uttar Pradesh',
    pincode: '244901',
    latitude: 28.7935,
    longitude: 79.1846,
  },
  {
    id: 'hub_indore',
    displayName: 'Indore, Madhya Pradesh - 452001',
    village: 'Indore',
    taluka: 'Indore',
    district: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    id: 'hub_mumbai',
    displayName: 'Mumbai, Maharashtra - 400001',
    village: 'Mumbai',
    taluka: 'Mumbai City',
    district: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    latitude: 18.9388,
    longitude: 72.8354,
  },
  {
    id: 'hub_bengaluru',
    displayName: 'Bengaluru, Karnataka - 560001',
    village: 'Bengaluru',
    taluka: 'Bengaluru North',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: 'hub_chennai',
    displayName: 'Chennai, Tamil Nadu - 600001',
    village: 'Chennai',
    taluka: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: 'hub_kolkata',
    displayName: 'Kolkata, West Bengal - 700001',
    village: 'Kolkata',
    taluka: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pincode: '700001',
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    id: 'hub_lucknow',
    displayName: 'Lucknow, Uttar Pradesh - 226001',
    village: 'Lucknow',
    taluka: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226001',
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    id: 'hub_hyderabad',
    displayName: 'Hyderabad, Telangana - 500001',
    village: 'Hyderabad',
    taluka: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    id: 'hub_guwahati',
    displayName: 'Guwahati, Assam - 781001',
    village: 'Guwahati',
    taluka: 'Kamrup Metropolitan',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    pincode: '781001',
    latitude: 26.1445,
    longitude: 91.7362,
  },
  {
    id: 'hub_ludhiana',
    displayName: 'Ludhiana, Punjab - 141001',
    village: 'Ludhiana',
    taluka: 'Ludhiana East',
    district: 'Ludhiana',
    state: 'Punjab',
    pincode: '141001',
    latitude: 30.901,
    longitude: 75.8573,
  },
  {
    id: 'hub_jaipur',
    displayName: 'Jaipur, Rajasthan - 302001',
    village: 'Jaipur',
    taluka: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    latitude: 26.9124,
    longitude: 75.7873,
  },
  {
    id: 'hub_ahmedabad',
    displayName: 'Ahmedabad, Gujarat - 380001',
    village: 'Ahmedabad',
    taluka: 'Ahmedabad City',
    district: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    latitude: 23.0225,
    longitude: 72.5714,
  },
];

// Helper to calculate approximate distance in km between two lat/lng pairs
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const locationService = {
  /**
   * Search location across all of India using live geocoding API
   * Supports: Village, Town, City, District, Taluka, State, or 6-digit Pincode
   */
  async searchLocation(query: string): Promise<LocationSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const isSixDigitPincode = /^\d{6}$/.test(trimmed);

    // 1. Try Photon (OSM) search for India (CORS-friendly, fast, reliable in browser)
    try {
      const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
      const response = await fetch(pUrl, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.features) && data.features.length > 0) {
          const inFeatures = data.features.filter(
            (f: any) =>
              !f.properties?.countrycode ||
              f.properties.countrycode === 'IN' ||
              f.properties.country === 'India'
          );
          if (inFeatures.length > 0) {
            return inFeatures.map((f: any, idx: number) => {
              const p = f.properties || {};
              const village = p.name || p.city || p.town || '';
              const taluka = cleanAdminName(p.county || p.subdistrict || '');
              const district = cleanAdminName(p.district || p.county || '');
              const state = matchOfficialState(p.state || '');
              const pincode = p.postcode || (isSixDigitPincode ? trimmed : '');

              const parts = [village, taluka, district, state]
                .filter(Boolean)
                .filter((v, i, a) => a.indexOf(v) === i);

              const display = parts.join(', ') + (pincode ? ` - ${pincode}` : '');
              const [lon, lat] = f.geometry?.coordinates || [74.1071, 20.0797];

              return {
                id: `photon_${p.osm_id || idx}`,
                displayName: display,
                village: village || p.name || '',
                taluka: taluka || village,
                district: district || taluka || village || '',
                state: state || '',
                pincode,
                latitude: lat,
                longitude: lon,
              };
            });
          }
        }
      }
    } catch {
      // Fallback below
    }

    // 2. Try Nominatim search
    try {
      let url = isSixDigitPincode
        ? `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(trimmed)}&countrycodes=in&format=json&addressdetails=1&limit=6`
        : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&countrycodes=in&format=json&addressdetails=1&limit=6`;

      if (LOCATION_API_KEY) {
        url += `&key=${LOCATION_API_KEY}`;
      }

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'KrishiSarthak/1.0 (SIH 2026 Prototype)',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const rawResults = await response.json();
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          return rawResults.map((item: any, idx: number) => {
            const addr = item.address || {};

            const village =
              addr.village ||
              addr.town ||
              addr.suburb ||
              addr.city ||
              addr.hamlet ||
              addr.neighbourhood ||
              addr.residential ||
              item.name ||
              '';

            const taluka = cleanAdminName(addr.county || addr.tehsil || addr.taluk || addr.subdistrict || '');
            const rawDist = cleanAdminName(addr.state_district || addr.county || addr.district || '');
            const state = normalizeStateName(addr.state || '') || matchOfficialState(addr.state || '');
            const district = normalizeDistrictName(state, rawDist) || rawDist;
            const pincode = addr.postcode || (isSixDigitPincode ? trimmed : '');

            const parts = [village, taluka, district, state]
              .filter(Boolean)
              .filter((v, i, a) => a.indexOf(v) === i);

            const display = parts.join(', ') + (pincode ? ` - ${pincode}` : '');

            return {
              id: `${item.place_id || idx}`,
              displayName: display || item.display_name,
              village: village || item.name || '',
              taluka: taluka || village,
              district: district || taluka || village || '',
              state: state || '',
              pincode,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
            };
          });
        }
      }
    } catch {
      // Network error -> fallback to local agricultural hub matches
    }

    // 3. Fallback: match against offline Indian agricultural hubs
    const qLower = trimmed.toLowerCase();
    const matches = OFFLINE_AGRICULTURAL_HUBS.filter(
      (hub) =>
        hub.displayName.toLowerCase().includes(qLower) ||
        hub.village.toLowerCase().includes(qLower) ||
        hub.district.toLowerCase().includes(qLower) ||
        hub.state.toLowerCase().includes(qLower) ||
        hub.pincode.includes(trimmed)
    );

    return matches;
  },

  /**
   * Request browser geolocation permission and acquire real coordinates.
   * Follows strict production guidelines:
   * - Native navigator.geolocation.getCurrentPosition()
   * - Sensible options: enableHighAccuracy: true, timeout: 12000ms, maximumAge: 0
   * - Fallback attempt with standard accuracy if GPS hardware fix times out
   * - Clear error mapping for permission denied, timeout, unavailable, or unsupported
   */
  async getCurrentCoordinates(): Promise<Coordinates> {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator) || !navigator.geolocation) {
      throw new Error('Location detection is not supported on this device/browser. Please select your location manually.');
    }

    return new Promise<Coordinates>((resolve, reject) => {
      let isSettled = false;

      // Fallback helper for devices without hardware GPS (e.g. desktop browsers)
      const tryStandardAccuracyFallback = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (isSettled) return;
            isSettled = true;
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          (err) => {
            if (isSettled) return;
            isSettled = true;
            reject(formatGeolocationError(err));
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 0,
          }
        );
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isSettled) return;
          isSettled = true;
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (isSettled) return;

          // If high-accuracy timed out, attempt standard accuracy once
          if (error.code === error.TIMEOUT) {
            try {
              tryStandardAccuracyFallback();
              return;
            } catch {
              // Ignore and fall through
            }
          }

          isSettled = true;
          reject(formatGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  },

  /**
   * Reverse geocode coordinates to extract State, District, Taluka, Village, Pincode
   * Uses multi-tier free & reliable providers with graceful fallback to nearest agricultural centroid.
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<DetectedLocationResult> {
    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        success: false,
        errorMessage: 'Invalid coordinates provided for location reverse geocoding.',
      };
    }

    let rawState = '';
    let rawDistrict = '';
    let rawTaluka = '';
    let rawVillage = '';
    let rawPincode = '';
    let formatted = '';

    // ----------------------------------------------------
    // Provider 1: OpenStreetMap Nominatim
    // ----------------------------------------------------
    try {
      let nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      if (LOCATION_API_KEY) {
        nomUrl += `&key=${LOCATION_API_KEY}`;
      }

      const nomResp = await fetch(nomUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'KrishiSarthak/1.0 (SIH 2026 Agricultural Prototype; contact@krishisarthak.in)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (nomResp.ok) {
        const nomData = await nomResp.json();
        const addr = nomData.address || {};
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
    } catch (e) {
      console.warn('[locationService] Nominatim reverse geocode warning:', e);
    }

    // ----------------------------------------------------
    // Provider 2: BigDataCloud client API (Free, CORS-friendly)
    // ----------------------------------------------------
    if (!rawState || !rawDistrict) {
      try {
        const bdcResp = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (bdcResp.ok) {
          const data = await bdcResp.json();
          if (!rawState) rawState = data.principalSubdivision || '';

          const adminList: any[] = data.localityInfo?.administrative || [];

          if (!rawDistrict) {
            const districtObj = adminList.find(
              (a) => /district/i.test(a.name) || (a.adminLevel === 5 && a.name !== rawState)
            );
            if (districtObj) {
              rawDistrict = districtObj.name;
            } else if (adminList[2]?.name && adminList[2]?.name !== rawState) {
              rawDistrict = adminList[2].name;
            }
          }

          if (!rawTaluka) {
            const talukaObj = adminList.find(
              (a) =>
                /taluk|tehsil|subdistrict/i.test(a.name) ||
                (a.adminLevel === 6 && a.name !== rawDistrict && a.name !== rawState)
            );
            if (talukaObj) {
              rawTaluka = talukaObj.name;
            } else if (
              adminList[3]?.name &&
              adminList[3]?.name !== rawDistrict &&
              adminList[3]?.name !== rawState
            ) {
              rawTaluka = adminList[3].name;
            }
          }

          if (!rawVillage) rawVillage = data.locality || data.city || '';
          if (!rawPincode) rawPincode = data.postcode || '';
        }
      } catch (e) {
        console.warn('[locationService] BigDataCloud reverse geocode warning:', e);
      }
    }

    // ----------------------------------------------------
    // Provider 3: Photon (Komoot OSM) reverse geocode
    // ----------------------------------------------------
    if (!rawState || !rawDistrict) {
      try {
        const pResp = await fetch(
          `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (pResp.ok) {
          const pData = await pResp.json();
          const props = pData.features?.[0]?.properties || {};
          if (!rawState && props.state) rawState = props.state;
          if (!rawDistrict && (props.district || props.county)) rawDistrict = props.district || props.county;
          if (!rawTaluka && (props.county || props.subdistrict)) rawTaluka = props.county || props.subdistrict;
          if (!rawVillage && (props.name || props.city || props.town)) rawVillage = props.name || props.city || props.town;
          if (!rawPincode && props.postcode) rawPincode = props.postcode;
        }
      } catch (e) {
        console.warn('[locationService] Photon reverse geocode warning:', e);
      }
    }

    // ----------------------------------------------------
    // Provider 4: Backend Location Proxy API (/api/location/reverse)
    // ----------------------------------------------------
    if (!rawState || !rawDistrict) {
      try {
        const backendRes = await apiClient<{ success: boolean; data?: any }>(
          `/location/reverse?lat=${latitude}&lng=${longitude}`,
          { timeout: 5000 }
        );
        if (backendRes?.success && backendRes.data) {
          const d = backendRes.data;
          if (!rawState) rawState = d.state || '';
          if (!rawDistrict) rawDistrict = d.district || '';
          if (!rawTaluka) rawTaluka = d.taluka || '';
          if (!rawVillage) rawVillage = d.village || '';
          if (!rawPincode) rawPincode = d.pincode || '';
        }
      } catch (e) {
        console.warn('[locationService] Backend proxy reverse geocode notice:', e);
      }
    }

    // ----------------------------------------------------
    // Provider 5: Nearest Agricultural Hub Centroid Fallback
    // ----------------------------------------------------
    if (!rawState || !rawDistrict) {
      let closestHub: LocationSearchResult | null = null;
      let minDistance = Infinity;

      for (const hub of OFFLINE_AGRICULTURAL_HUBS) {
        const d = haversineDistanceKm(latitude, longitude, hub.latitude, hub.longitude);
        if (d < minDistance) {
          minDistance = d;
          closestHub = hub;
        }
      }

      // If within 150 km of a known hub, use its state & district as fallback
      if (closestHub && minDistance <= 150) {
        if (!rawState) rawState = closestHub.state;
        if (!rawDistrict) rawDistrict = closestHub.district;
        if (!rawTaluka) rawTaluka = closestHub.taluka;
        if (!rawVillage) rawVillage = closestHub.village;
        if (!rawPincode) rawPincode = closestHub.pincode;
      }
    }

    // ----------------------------------------------------
    // Normalization & Hierarchy Validation
    // ----------------------------------------------------
    const state = normalizeStateName(rawState) || matchOfficialState(rawState);
    const cleanedDist = cleanAdminName(rawDistrict);
    const district = normalizeDistrictName(state, cleanedDist) || cleanedDist || '';
    const taluka = cleanAdminName(rawTaluka) || cleanAdminName(rawDistrict) || '';
    const village = cleanAdminName(rawVillage) || taluka || district || '';
    
    let pincode = rawPincode.replace(/\D/g, '').slice(0, 6);
    if (!pincode && state && district && (taluka || village)) {
      pincode = findPincodeForVillage(state, district, taluka || village, village || taluka) || '';
    }

    const parts = [village, taluka, district, state]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    formatted = parts.join(', ') + (pincode ? ` - ${pincode}` : '');

    return {
      success: true,
      latitude,
      longitude,
      state,
      district,
      taluka,
      village,
      pincode,
      formattedAddress: formatted || [village, taluka, district, state].filter(Boolean).join(', '),
    };
  },

  /**
   * Combined call: Coordinate fetch + reverse geocoding
   */
  async detectCurrentLocation(): Promise<DetectedLocationResult> {
    const coords = await this.getCurrentCoordinates();
    return await this.reverseGeocode(coords.latitude, coords.longitude);
  },
};
