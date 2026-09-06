import { ALL_INDIAN_STATES_AND_UTS } from '../data/indianStates';
import {
  normalizeStateName,
  normalizeDistrictName,
  findPincodeForVillage,
} from '../data/locations';

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
const LOCATION_API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_LOCATION_API_KEY) || '';

// Clean administrative words like " Taluka", " District", " Tehsil"
function cleanAdminName(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/\b(Taluka|Tehsil|Sub-District|Subdistrict|District|Division)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Find closest matching official state name
function matchOfficialState(rawState?: string): string {
  if (!rawState) return '';
  const clean = rawState.trim().toLowerCase();
  const found = ALL_INDIAN_STATES_AND_UTS.find(
    (s) => s.name.toLowerCase() === clean || clean.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(clean)
  );
  return found ? found.name : rawState.trim();
}

// Offline fallback suggestions for key agricultural and Indian hubs
const OFFLINE_AGRICULTURAL_HUBS: LocationSearchResult[] = [
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
            (f: any) => !f.properties?.countrycode || f.properties.countrycode === 'IN' || f.properties.country === 'India'
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

    // 2. Try Nominatim if API key provided or network accessible
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
              .filter((p) => Boolean(p) && p !== taluka && p !== district ? true : Boolean(p))
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
   * Request browser geolocation permission and acquire real coordinates
   */
  async getCurrentCoordinates(): Promise<Coordinates> {
    const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
    console.log('Geolocation supported:', isSupported);

    if (!isSupported) {
      throw new Error('Unable to detect your location. Please search manually.');
    }

    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      console.warn('Geolocation requires a secure context (HTTPS or localhost).');
    }

    console.log('Requesting current location...');

    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log('Location coordinates:', latitude, longitude);
          resolve({
            latitude,
            longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error.code, error.message);
          let message = 'Unable to detect your location. Please search manually.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission was denied. Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Your current location could not be determined. Please search for your location manually.';
              break;
            case error.TIMEOUT:
              message = 'Location detection took too long. Please try again or search manually.';
              break;
            default:
              message = 'Unable to detect your location. Please search manually.';
              break;
          }

          reject(new Error(message));
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    });
  },

  /**
   * Reverse geocode coordinates to extract State, District, Taluka, Village, Pincode
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<DetectedLocationResult> {
    let rawState = '';
    let rawDistrict = '';
    let rawTaluka = '';
    let rawVillage = '';
    let rawPincode = '';
    let formatted = '';

    // Provider 1: BigDataCloud client API (Free, CORS-friendly, reliable in browsers)
    try {
      const resp = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (resp.ok) {
        const data = await resp.json();
        rawState = data.principalSubdivision || '';

        const adminList: any[] = data.localityInfo?.administrative || [];

        // Identify district
        const districtObj = adminList.find(
          (a) => /district/i.test(a.name) || (a.adminLevel === 5 && a.name !== rawState)
        );
        if (districtObj) {
          rawDistrict = districtObj.name;
        } else if (adminList[2]?.name && adminList[2]?.name !== rawState) {
          rawDistrict = adminList[2].name;
        }

        // Identify taluka / tehsil
        const talukaObj = adminList.find(
          (a) => /taluk|tehsil|subdistrict/i.test(a.name) || (a.adminLevel === 6 && a.name !== rawDistrict)
        );
        if (talukaObj) {
          rawTaluka = talukaObj.name;
        } else if (adminList[3]?.name && adminList[3]?.name !== rawDistrict && adminList[3]?.name !== rawState) {
          rawTaluka = adminList[3].name;
        }

        rawVillage = data.locality || data.city || '';
        rawPincode = data.postcode || '';
        formatted = `${rawVillage || rawTaluka}, ${rawDistrict || rawTaluka}, ${rawState}`.replace(/^, |, $/g, '');
      }
    } catch (e) {
      console.warn('[locationService] BigDataCloud reverse geocode error:', e);
    }

    // Provider 2: Photon (Komoot OSM) reverse geocode for additional precision
    if (!rawPincode || !rawDistrict || !rawTaluka || !rawVillage) {
      try {
        const pResp = await fetch(
          `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
          { signal: AbortSignal.timeout(5000) }
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
        console.warn('[locationService] Photon reverse geocode error:', e);
      }
    }

    // Provider 3: OpenStreetMap Nominatim (if API key provided or accessible)
    if (LOCATION_API_KEY && (!rawState || !rawDistrict)) {
      try {
        const nResp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=16&key=${LOCATION_API_KEY}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (nResp.ok) {
          const nData = await nResp.json();
          const addr = nData.address || {};
          if (!rawState) rawState = addr.state || '';
          if (!rawDistrict) rawDistrict = addr.state_district || addr.district || addr.county || '';
          if (!rawTaluka) rawTaluka = addr.county || addr.subdistrict || addr.tehsil || addr.taluk || '';
          if (!rawVillage) rawVillage = addr.village || addr.town || addr.city || addr.suburb || '';
          if (!rawPincode) rawPincode = addr.postcode || '';
        }
      } catch (e) {
        console.warn('[locationService] Nominatim reverse geocode error:', e);
      }
    }

    const state = normalizeStateName(rawState) || matchOfficialState(rawState);
    const cleanedDist = cleanAdminName(rawDistrict);
    const district = normalizeDistrictName(state, cleanedDist) || cleanedDist || cleanAdminName(rawTaluka) || cleanAdminName(rawVillage) || '';
    const taluka = cleanAdminName(rawTaluka) || cleanAdminName(rawDistrict) || cleanAdminName(rawVillage) || '';
    const village = rawVillage.trim() || taluka || district || '';
    let pincode = rawPincode;
    if (!pincode && state && district && taluka && village) {
      pincode = findPincodeForVillage(state, district, taluka, village) || '';
    }

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
