import { ALL_INDIAN_STATES_AND_UTS } from '../data/indianStates';

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
const LOCATION_API_KEY = import.meta.env.VITE_LOCATION_API_KEY || '';

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

    try {
      // Build search URL for India
      let url = isSixDigitPincode
        ? `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(trimmed)}&countrycodes=in&format=json&addressdetails=1&limit=6`
        : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&countrycodes=in&format=json&addressdetails=1&limit=6`;

      if (LOCATION_API_KEY) {
        url += `&key=${LOCATION_API_KEY}`;
      }

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'KrishiSarthak/1.0',
        },
        signal: AbortSignal.timeout(6000),
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
            const district = cleanAdminName(addr.state_district || addr.county || addr.district || '');
            const state = matchOfficialState(addr.state || '');
            const pincode = addr.postcode || (isSixDigitPincode ? trimmed : '');

            // Build clear, clean title
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
      // Network error or rate limiting -> gracefully fall back to local agricultural hub matches
    }

    // Fallback: match against offline Indian agricultural hubs
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
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation is not supported by your browser. Please search for your location manually.');
    }

    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let msg = "We couldn't access your location. Please search for your location manually.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please search for your location manually.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location detection timed out. Please search for your location manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is currently unavailable. Please search for your location manually.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
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

    // Attempt 1: OpenStreetMap Nominatim reverse
    try {
      let url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=16`;
      if (LOCATION_API_KEY) {
        url += `&key=${LOCATION_API_KEY}`;
      }

      const resp = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'KrishiSarthak/1.0',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        rawState = addr.state || '';
        rawDistrict = addr.state_district || addr.county || addr.district || '';
        rawTaluka = addr.county || addr.taluk || addr.tehsil || addr.subdistrict || '';
        rawVillage =
          addr.village ||
          addr.town ||
          addr.suburb ||
          addr.city ||
          addr.hamlet ||
          addr.residential ||
          addr.neighbourhood ||
          '';
        rawPincode = addr.postcode || '';
        formatted = data.display_name || '';
      }
    } catch {
      // Attempt 2: BigDataCloud client API fallback
      try {
        const resp = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (resp.ok) {
          const data = await resp.json();
          rawState = data.principalSubdivision || '';
          rawDistrict = data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name || '';
          rawTaluka = data.localityInfo?.administrative?.[3]?.name || data.locality || '';
          rawVillage = data.locality || data.localityInfo?.administrative?.[4]?.name || '';
          rawPincode = data.postcode || '';
          formatted = `${rawVillage || rawTaluka}, ${rawDistrict}, ${rawState}`.replace(/^, /, '');
        }
      } catch {
        // Fallback: use coordinates
      }
    }

    const state = matchOfficialState(rawState);
    const district = cleanAdminName(rawDistrict) || cleanAdminName(rawTaluka) || cleanAdminName(rawVillage) || '';
    const taluka = cleanAdminName(rawTaluka) || cleanAdminName(rawDistrict) || cleanAdminName(rawVillage) || '';
    const village = rawVillage.trim() || taluka || district || '';

    return {
      success: true,
      latitude,
      longitude,
      state,
      district,
      taluka,
      village,
      pincode: rawPincode,
      formattedAddress: formatted || `${village}, ${taluka}, ${district}, ${state}`,
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
