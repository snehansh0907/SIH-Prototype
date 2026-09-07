import type { SeverityLevel } from '../types';
import type { BackendFarm } from './farmService';
import type { FarmerUser } from '../types';
import {
  getDistrictsForState,
  getTalukasForDistrict,
  getVillagesForTaluka,
  normalizeDistrictName,
  normalizeStateName,
} from '../data/locations';

export interface NearbyRegion {
  id: string;
  name: string;
  nameHi?: string;
  nameMr: string;
  taluka: string;
  district: string;
  districtHi?: string;
  districtMr: string;
  state: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  isHomeLocation?: boolean;
}

export interface HeatZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: SeverityLevel;
  areaName: string;
  areaNameHi?: string;
  areaNameMr: string;
  crop: string;
  reportedCases: number;
  distanceKm: number;
}

export interface LocationHeatDataset {
  id: string;
  name: string;
  nameHi?: string;
  nameMr: string;
  taluka: string;
  district: string;
  districtHi?: string;
  districtMr: string;
  status: SeverityLevel;
  activeCasesCount: number;
  diseaseTrend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
  advisory: string;
  advisoryHi?: string;
  advisoryMr: string;
  heatZones: HeatZone[];
}

// ---------------------------------------------------------------------------
// Geographic Centroids for Major Agricultural Districts across India
// ---------------------------------------------------------------------------
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Maharashtra
  'nashik': { lat: 20.0063, lng: 73.7900 },
  'niphad': { lat: 20.0850, lng: 74.1100 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'satara': { lat: 17.6805, lng: 73.9937 },
  'ahmednagar': { lat: 19.0952, lng: 74.7496 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'sangli': { lat: 16.8524, lng: 74.5815 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'amravati': { lat: 20.9320, lng: 77.7523 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },

  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'sanganer': { lat: 26.8150, lng: 75.7680 },
  'dahmi kalan': { lat: 26.8429, lng: 75.5654 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'alwar': { lat: 27.5530, lng: 76.6346 },
  'ganganagar': { lat: 29.9038, lng: 73.8772 },

  // Punjab
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'khanna': { lat: 30.7071, lng: 76.2163 },
  'samrala': { lat: 30.8384, lng: 76.1912 },
  'jalandhar': { lat: 31.3260, lng: 75.5762 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'patiala': { lat: 30.3398, lng: 76.3869 },
  'bathinda': { lat: 30.2110, lng: 74.9455 },

  // Madhya Pradesh
  'indore': { lat: 22.7196, lng: 75.8577 },
  'sanwer': { lat: 22.9774, lng: 75.8272 },
  'kshipra': { lat: 22.8833, lng: 75.9833 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'ujjain': { lat: 23.1765, lng: 75.7885 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },

  // Telangana
  'sangareddy': { lat: 17.6294, lng: 78.0917 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'rangareddy': { lat: 17.2283, lng: 78.3475 },
  'medak': { lat: 18.0475, lng: 78.2617 },
  'warangal': { lat: 17.9784, lng: 79.5941 },
  'karimnagar': { lat: 18.4386, lng: 79.1288 },
  'nizamabad': { lat: 18.6725, lng: 78.0941 },

  // Andhra Pradesh
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'krishna': { lat: 16.1809, lng: 81.1303 },
  'kurnool': { lat: 15.8281, lng: 78.0373 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },

  // Odisha
  'khordha': { lat: 20.1815, lng: 85.6200 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'cuttack': { lat: 20.4625, lng: 85.8828 },
  'balasore': { lat: 21.4934, lng: 86.9338 },
  'puri': { lat: 19.8135, lng: 85.8312 },

  // Uttar Pradesh
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur nagar': { lat: 26.4499, lng: 80.3319 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'prayagraj': { lat: 25.4358, lng: 81.8463 },
  'meerut': { lat: 28.9845, lng: 77.7064 },

  // Karnataka
  'bengaluru urban': { lat: 12.9716, lng: 77.5946 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'belagavi': { lat: 15.8497, lng: 74.4977 },
  'dharwad': { lat: 15.4589, lng: 75.0078 },

  // Gujarat
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'anand': { lat: 22.5645, lng: 72.9289 },

  // Haryana
  'karnal': { lat: 29.6857, lng: 76.9905 },
  'hisar': { lat: 29.1492, lng: 75.7217 },
  'ambala': { lat: 30.3782, lng: 76.7767 },

  // Tamil Nadu
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'thanjavur': { lat: 10.7870, lng: 79.1378 },

  // Bihar
  'patna': { lat: 25.5941, lng: 85.1376 },
  'muzaffarpur': { lat: 26.1226, lng: 85.3906 },
};

// ---------------------------------------------------------------------------
// Rich Catalog of Sibling Localities/Talukas for Prominent Districts
// ---------------------------------------------------------------------------
export const DISTRICT_TOWNS_CATALOG: Record<
  string,
  Array<{ name: string; nameHi?: string; nameMr?: string; lat?: number; lng?: number; taluka?: string }>
> = {
  'sangareddy': [
    { name: 'Sangareddy', nameHi: 'संगारेड्डी', nameMr: 'संगारेड्डी', lat: 17.6294, lng: 78.0917, taluka: 'Sangareddy' },
    { name: 'Kandi', nameHi: 'कांडी', nameMr: 'कांडी', lat: 17.5920, lng: 78.1064, taluka: 'Kandi' },
    { name: 'Patancheru', nameHi: 'पाटनचेरु', nameMr: 'पाटनचेरु', lat: 17.5284, lng: 78.2657, taluka: 'Patancheru' },
    { name: 'Sadasivpet', nameHi: 'सदाशिवपेट', nameMr: 'सदाशिवपेठ', lat: 17.6186, lng: 77.9547, taluka: 'Sadasivpet' },
    { name: 'Zahirabad', nameHi: 'जहीराबाद', nameMr: 'झहीराबाद', lat: 17.6797, lng: 77.6074, taluka: 'Zahirabad' },
    { name: 'Jogipet', nameHi: 'जोगीपेट', nameMr: 'जोगीपेठ', lat: 17.8183, lng: 78.0267, taluka: 'Jogipet' },
    { name: 'Hathnoora', nameHi: 'हाथनूरा', nameMr: 'हाथनूरा', lat: 17.7475, lng: 78.1725, taluka: 'Hathnoora' },
  ],
  'jaipur': [
    { name: 'Dahmi Kalan', nameHi: 'दहमी कलां', nameMr: 'दहमी कलां', lat: 26.8429, lng: 75.5654, taluka: 'Sanganer' },
    { name: 'Sanganer', nameHi: 'सांगानेर', nameMr: 'सांगानेर', lat: 26.8150, lng: 75.7680, taluka: 'Sanganer' },
    { name: 'Bagru', nameHi: 'बगरू', nameMr: 'बगरू', lat: 26.8142, lng: 75.5450, taluka: 'Sanganer' },
    { name: 'Phulera', nameHi: 'फुलेरा', nameMr: 'फुलेरा', lat: 26.8730, lng: 75.2410, taluka: 'Phulera' },
    { name: 'Chaksu', nameHi: 'चाकसू', nameMr: 'चाकसू', lat: 26.6020, lng: 75.9520, taluka: 'Chaksu' },
    { name: 'Bassi', nameHi: 'बस्सी', nameMr: 'बस्सी', lat: 26.8320, lng: 76.0440, taluka: 'Bassi' },
    { name: 'Chomu', nameHi: 'चोमू', nameMr: 'चोमू', lat: 27.1720, lng: 75.7230, taluka: 'Chomu' },
  ],
  'ludhiana': [
    { name: 'Samrala', nameHi: 'समराला', nameMr: 'समराला', lat: 30.8384, lng: 76.1912, taluka: 'Khanna' },
    { name: 'Khanna', nameHi: 'खन्ना', nameMr: 'खन्ना', lat: 30.7071, lng: 76.2163, taluka: 'Khanna' },
    { name: 'Payal', nameHi: 'पायल', nameMr: 'पायल', lat: 30.7220, lng: 76.0580, taluka: 'Payal' },
    { name: 'Doraha', nameHi: 'दोराहा', nameMr: 'दोराहा', lat: 30.8030, lng: 76.0270, taluka: 'Doraha' },
    { name: 'Sahnewal', nameHi: 'साहनेवाल', nameMr: 'साहनेवाल', lat: 30.8440, lng: 75.9860, taluka: 'Ludhiana East' },
    { name: 'Jagraon', nameHi: 'जगरांव', nameMr: 'जगरांव', lat: 30.7850, lng: 75.4780, taluka: 'Jagraon' },
  ],
  'indore': [
    { name: 'Kshipra', nameHi: 'क्षिप्रा', nameMr: 'क्षिप्रा', lat: 22.8833, lng: 75.9833, taluka: 'Sanwer' },
    { name: 'Sanwer', nameHi: 'सांवेर', nameMr: 'सांवेर', lat: 22.9774, lng: 75.8272, taluka: 'Sanwer' },
    { name: 'Manglaya', nameHi: 'मांगलिया', nameMr: 'मांगलिया', lat: 22.8120, lng: 75.9010, taluka: 'Sanwer' },
    { name: 'Depalpur', nameHi: 'देपालपुर', nameMr: 'देपालपूर', lat: 22.8530, lng: 75.5480, taluka: 'Depalpur' },
    { name: 'Mhow', nameHi: 'महू', nameMr: 'महू', lat: 22.5530, lng: 75.7630, taluka: 'Mhow' },
    { name: 'Rau', nameHi: 'राऊ', nameMr: 'राऊ', lat: 22.6340, lng: 75.8110, taluka: 'Indore' },
  ],
  'nashik': [
    { name: 'Niphad', nameHi: 'निफाड़', nameMr: 'निफाड', lat: 20.0850, lng: 74.1100, taluka: 'Niphad' },
    { name: 'Pimpalgaon', nameHi: 'पिंपलगांव', nameMr: 'पिंपळगाव बसवंत', lat: 20.1650, lng: 73.9850, taluka: 'Niphad' },
    { name: 'Chandori', nameHi: 'चांदोरी', nameMr: 'चांदोरी', lat: 20.0797, lng: 74.0322, taluka: 'Niphad' },
    { name: 'Ozar', nameHi: 'ओझर', nameMr: 'ओझर', lat: 20.0927, lng: 73.9189, taluka: 'Niphad' },
    { name: 'Lasalgaon', nameHi: 'लासलगांव', nameMr: 'लासलगाव', lat: 20.1450, lng: 74.2280, taluka: 'Niphad' },
    { name: 'Dindori', nameHi: 'दिंडोरी', nameMr: 'दिंडोरी', lat: 20.2010, lng: 73.8320, taluka: 'Dindori' },
    { name: 'Sinnar', nameHi: 'सिन्नर', nameMr: 'सिन्नर', lat: 19.8450, lng: 73.9960, taluka: 'Sinnar' },
  ],
};

/**
 * Haversine distance in kilometers between two lat/lng coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Normalizes and extracts the authentic farm location details.
 * Prevents artificial Maharashtra default coordinates (20.085, 74.11)
 * from contaminating farmers registered in other states/districts.
 */
export function resolveFarmLocation(
  user: FarmerUser | null,
  farm: BackendFarm | null
): {
  village: string;
  taluka: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  crop: string;
  isDemoUser: boolean;
} {
  const isDemo = user?.userType === 'demo' || Boolean(user?.isDemo);

  const rawDistrict = (farm?.district || user?.district || '').trim();
  const rawTaluka = (farm?.taluka || user?.taluka || '').trim();
  const rawVillage = (farm?.village || user?.village || '').trim();
  const rawState = (user?.state || '').trim();
  const crop = (user?.monitoredCrop || 'Tomato').trim();

  // If demo user without specific profile, defaults to Niphad, Nashik
  if (isDemo && (!rawDistrict || rawDistrict.toLowerCase() === 'nashik')) {
    return {
      village: rawVillage || 'Niphad',
      taluka: rawTaluka || 'Niphad',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: farm?.latitude ?? user?.latitude ?? 20.156556,
      longitude: farm?.longitude ?? user?.longitude ?? 74.117339,
      crop,
      isDemoUser: true,
    };
  }

  // Determine State and District using official normalization
  const normState = normalizeStateName(rawState);
  const normDistrict = normalizeDistrictName(normState, rawDistrict) || rawDistrict;

  // Coordinate verification
  let latitude: number | undefined = farm?.latitude ?? user?.latitude;
  let longitude: number | undefined = farm?.longitude ?? user?.longitude;

  // Check if coordinates were artificial Nashik defaults (20.085, 74.11)
  const isLegacyNashikFallback =
    latitude !== undefined &&
    longitude !== undefined &&
    Math.abs(latitude - 20.085) < 0.05 &&
    Math.abs(longitude - 74.11) < 0.05 &&
    normDistrict.toLowerCase() !== 'nashik';

  // If missing or artificial fallback, resolve genuine district coordinates
  if (!latitude || !longitude || isLegacyNashikFallback) {
    const distKey = normDistrict.toLowerCase();
    const villKey = rawVillage.toLowerCase();
    const talKey = rawTaluka.toLowerCase();

    if (DISTRICT_COORDINATES[villKey]) {
      latitude = DISTRICT_COORDINATES[villKey].lat;
      longitude = DISTRICT_COORDINATES[villKey].lng;
    } else if (DISTRICT_COORDINATES[talKey]) {
      latitude = DISTRICT_COORDINATES[talKey].lat;
      longitude = DISTRICT_COORDINATES[talKey].lng;
    } else if (DISTRICT_COORDINATES[distKey]) {
      latitude = DISTRICT_COORDINATES[distKey].lat;
      longitude = DISTRICT_COORDINATES[distKey].lng;
    } else {
      latitude = undefined;
      longitude = undefined;
    }
  }

  return {
    village: rawVillage || rawTaluka || normDistrict,
    taluka: rawTaluka || rawVillage || normDistrict,
    district: normDistrict || 'Local Area',
    state: normState || 'India',
    latitude,
    longitude,
    crop,
    isDemoUser: false,
  };
}

/**
 * Generate dynamically relevant nearby region chips for the authenticated farmer.
 * Priority:
 *   1. Option A (Coordinates available): Proximity search sorted by distance.
 *   2. Option B (Coordinates unavailable): Administrative hierarchy (Taluka -> District).
 *   3. Fallback: User's home location without foreign state contamination.
 */
export function getNearbyRegionsForLocation(
  user: FarmerUser | null,
  farm: BackendFarm | null
): NearbyRegion[] {
  const loc = resolveFarmLocation(user, farm);
  const regions: NearbyRegion[] = [];
  const addedNames = new Set<string>();

  const primaryName = loc.village || loc.taluka || loc.district;
  const primaryId = primaryName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // 1. First chip is ALWAYS the user's actual current farm location
  const homeRegion: NearbyRegion = {
    id: primaryId,
    name: primaryName,
    nameHi: primaryName,
    nameMr: primaryName,
    taluka: loc.taluka,
    district: loc.district,
    state: loc.state,
    latitude: loc.latitude,
    longitude: loc.longitude,
    distanceKm: 0,
    isHomeLocation: true,
  };

  regions.push(homeRegion);
  addedNames.add(primaryName.toLowerCase());

  const distKey = loc.district.toLowerCase();

  // -------------------------------------------------------------------------
  // OPTION A: Proximity Search with Coordinates
  // -------------------------------------------------------------------------
  if (loc.latitude !== undefined && loc.longitude !== undefined) {
    const candidatePool: Array<{
      name: string;
      nameHi?: string;
      nameMr?: string;
      taluka: string;
      district: string;
      lat: number;
      lng: number;
    }> = [];

    // A1. Check known catalog for this district
    if (DISTRICT_TOWNS_CATALOG[distKey]) {
      for (const town of DISTRICT_TOWNS_CATALOG[distKey]) {
        if (!addedNames.has(town.name.toLowerCase()) && town.lat && town.lng) {
          candidatePool.push({
            name: town.name,
            nameHi: town.nameHi,
            nameMr: town.nameMr,
            taluka: town.taluka || loc.taluka,
            district: loc.district,
            lat: town.lat,
            lng: town.lng,
          });
        }
      }
    }

    // A2. Check pre-indexed talukas and villages from locations.ts
    const talukas = getTalukasForDistrict(loc.state, loc.district);
    for (const t of talukas) {
      if (!addedNames.has(t.name.toLowerCase())) {
        const coords = DISTRICT_COORDINATES[t.name.toLowerCase()];
        if (coords) {
          candidatePool.push({
            name: t.name,
            nameHi: t.nameHi,
            nameMr: t.nameMr,
            taluka: t.name,
            district: loc.district,
            lat: coords.lat,
            lng: coords.lng,
          });
        }
      }

      if (t.villages) {
        for (const v of t.villages) {
          if (!addedNames.has(v.name.toLowerCase())) {
            const vCoords = DISTRICT_COORDINATES[v.name.toLowerCase()];
            if (vCoords) {
              candidatePool.push({
                name: v.name,
                nameHi: v.nameHi,
                nameMr: v.nameMr,
                taluka: t.name,
                district: loc.district,
                lat: vCoords.lat,
                lng: vCoords.lng,
              });
            }
          }
        }
      }
    }

    // Calculate distance and sort ascending
    if (candidatePool.length > 0) {
      const sorted = candidatePool
        .map((c) => ({
          ...c,
          distance: calculateDistanceKm(loc.latitude!, loc.longitude!, c.lat, c.lng),
        }))
        .sort((a, b) => a.distance - b.distance);

      for (const item of sorted) {
        if (!addedNames.has(item.name.toLowerCase()) && regions.length < 5) {
          addedNames.add(item.name.toLowerCase());
          regions.push({
            id: item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: item.name,
            nameHi: item.nameHi || item.name,
            nameMr: item.nameMr || item.name,
            taluka: item.taluka,
            district: item.district,
            state: loc.state,
            latitude: item.lat,
            longitude: item.lng,
            distanceKm: item.distance,
          });
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // OPTION B: Administrative Hierarchy (When coordinates are missing or few)
  // -------------------------------------------------------------------------
  if (regions.length < 4) {
    // B1. Sibling villages in the same Taluka
    const siblingVillages = getVillagesForTaluka(loc.state, loc.district, loc.taluka);
    for (const v of siblingVillages) {
      if (!addedNames.has(v.name.toLowerCase()) && regions.length < 5) {
        addedNames.add(v.name.toLowerCase());
        regions.push({
          id: v.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: v.name,
          nameHi: v.nameHi || v.name,
          nameMr: v.nameMr || v.name,
          taluka: loc.taluka,
          district: loc.district,
          state: loc.state,
          distanceKm: regions.length * 1.8 + 1.2,
        });
      }
    }

    // B2. Neighboring Talukas in the same District
    const siblingTalukas = getTalukasForDistrict(loc.state, loc.district);
    for (const t of siblingTalukas) {
      if (!addedNames.has(t.name.toLowerCase()) && regions.length < 5) {
        addedNames.add(t.name.toLowerCase());
        regions.push({
          id: t.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: t.name,
          nameHi: t.nameHi || t.name,
          nameMr: t.nameMr || t.name,
          taluka: t.name,
          district: loc.district,
          state: loc.state,
          distanceKm: regions.length * 2.5 + 2.0,
        });
      }
    }

    // B3. Known Catalog Towns for this District
    if (DISTRICT_TOWNS_CATALOG[distKey]) {
      for (const town of DISTRICT_TOWNS_CATALOG[distKey]) {
        if (!addedNames.has(town.name.toLowerCase()) && regions.length < 5) {
          addedNames.add(town.name.toLowerCase());
          regions.push({
            id: town.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: town.name,
            nameHi: town.nameHi || town.name,
            nameMr: town.nameMr || town.name,
            taluka: town.taluka || loc.taluka,
            district: loc.district,
            state: loc.state,
            distanceKm: regions.length * 2.2 + 1.5,
          });
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // FALLBACK: Safe default ensuring UI stability without foreign contamination
  // -------------------------------------------------------------------------
  if (regions.length === 1) {
    if (loc.taluka && !addedNames.has(loc.taluka.toLowerCase())) {
      regions.push({
        id: loc.taluka.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: loc.taluka,
        nameHi: loc.taluka,
        nameMr: loc.taluka,
        taluka: loc.taluka,
        district: loc.district,
        state: loc.state,
        distanceKm: 3.5,
      });
    }
  }

  return regions;
}

// ---------------------------------------------------------------------------
// Advisory and Heatmap Dataset Generator
// ---------------------------------------------------------------------------
const CROP_ADVISORIES: Record<
  string,
  {
    en: string;
    hi: string;
    mr: string;
    primaryDisease: string;
  }
> = {
  sugarcane: {
    primaryDisease: 'Red Rot & Pyrilla',
    en: 'Red Rot vigilance alert for sugarcane growers. Ensure active field drainage, rogue out drying clumps, and spray carbendazim preventive.',
    hi: 'गन्ना उत्पादकों के लिए लाल सड़न सतर्कता अलर्ट। खेत में जल निकासी सुनिश्चित करें, सूखे गुच्छों को हटाएं और कार्बेन्डाजिम का सुरक्षात्मक छिड़काव करें।',
    mr: 'ऊस पट्ट्यात तांबेरा व खोड किडीचा प्रादुर्भाव. पाण्याचा निचरा सुरळीत ठेवा, बाधित उसाचे गड्डे नष्ट करा व प्रतिबंधात्मक बुरशीनाशक फवारणी करा.',
  },
  wheat: {
    primaryDisease: 'Yellow Rust',
    en: 'Yellow Rust surveillance alert for wheat growers. Inspect leaf canopies for yellow stripe pustules under cool, humid mornings. Apply propiconazole upon detection.',
    hi: 'गेहूं उत्पादकों के लिए पीला रतुआ निगरानी अलर्ट। ठंडी, नम सुबह पत्तियों पर पीले धब्बों की जांच करें और लक्षण दिखने पर प्रोपिकोनाज़ोल का छिड़काव करें।',
    mr: 'गहू पट्ट्यात पिवळा तांबेरा रोगाचा इशारा. सकाळी पानांवरील पिवळ्या पट्ट्यांची तपासणी करा आणि लक्षणे दिसल्यास प्रोपिकोनाझोल फवारा.',
  },
  soybean: {
    primaryDisease: 'Yellow Mosaic & Anthracnose',
    en: 'Yellow Mosaic Virus alert for soybean crops. Manage whitefly vectors using yellow sticky traps and apply recommended systemic insecticide promptly.',
    hi: 'सोयाबीन फसलों के लिए पीला मोज़ेक वायरस अलर्ट। पीले चिपचिपे जाल से सफेद मक्खी को नियंत्रित करें और अनुशंसित कीटनाशक का तुरंत छिड़काव करें।',
    mr: 'सोयाबीन पट्ट्यात पिवळा मोज़ेक रोगाचा इशारा. पांढऱ्या माशीचा बंदोबस्त करा व तात्काळ शिफारस केलेले कीटकनाशक वापरा.',
  },
  cotton: {
    primaryDisease: 'Pink Bollworm & Leaf Curl',
    en: 'Pink Bollworm and Leaf Curl alert across cotton fields. Install pheromone traps at 5 per acre and avoid excessive nitrogen application.',
    hi: 'कपास के खेतों में गुलाबी सुंडी और लीफ कर्ल का अलर्ट। प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं और अत्यधिक नाइट्रोजन से बचें।',
    mr: 'कापूस पट्ट्यात गुलाबी बोंडअळी व पानांचा चुरडा रोगाचा इशारा. एकरी ५ कामगंध सापळे लावा व नत्राचा अतिवापर टाळा.',
  },
  onion: {
    primaryDisease: 'Purple Blotch & Thrips',
    en: 'Purple Blotch fungal alert across onion belts. Avoid sprinkler irrigation during evening hours and spray mancozeb mixed with sticker.',
    hi: 'प्याज क्षेत्रों में बैंगनी धब्बा कवक का अलर्ट। शाम के समय फव्वारा सिंचाई से बचें और स्टीकर के साथ मैंकोजेब का छिड़काव करें।',
    mr: 'कांदा पट्ट्यात जांभळा करपा व फुलकिड्यांचा प्रादुर्भाव. संध्याकाळी स्प्रिंकलर टाळा व चिकट द्रवासह मँकोझेब फवारा.',
  },
  tomato: {
    primaryDisease: 'Early Blight & Leaf Curl',
    en: 'Early Blight outbreak alert for tomato growers. Maintain 4-foot ridge drainage channels and spray copper oxychloride preventive.',
    hi: 'टमाटर उत्पादकों के लिए अगेती झुलसा का अलर्ट। 4-फुट रिज जल निकासी नालियां बनाए रखें और सुरक्षात्मक कॉपर ऑक्सीक्लोराइड का छिड़काव करें।',
    mr: 'टोमॅटो पट्ट्यात करपा रोगाचा वाढता प्रादुर्भाव. पाण्याचा निचरा सुरळीत ठेवा व तांबयुक्त बुरशीनाशकाची फवारणी करा.',
  },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a LocationHeatDataset for a given region dynamically.
 */
export function generateRegionalHotspotDataset(
  region: NearbyRegion,
  cropName: string = 'Tomato'
): LocationHeatDataset {
  const normCrop = cropName.toLowerCase().trim();
  const advisoryTemplate =
    CROP_ADVISORIES[normCrop] || CROP_ADVISORIES.tomato;

  const seed = hashString(`${region.name}_${region.district}_${normCrop}`);
  
  // Deterministic case count based on seed (5 - 19 cases)
  const activeCasesCount = 5 + (seed % 15);
  const status: SeverityLevel =
    activeCasesCount >= 14 ? 'high' : activeCasesCount >= 8 ? 'moderate' : 'low';
  const diseaseTrend: 'increasing' | 'stable' | 'decreasing' =
    activeCasesCount >= 12 ? 'increasing' : activeCasesCount >= 7 ? 'stable' : 'decreasing';

  // Generate 3 spatial heat zones centered around this region
  const z1Cases = Math.max(2, Math.floor(activeCasesCount * 0.45));
  const z2Cases = Math.max(1, Math.floor(activeCasesCount * 0.35));
  const z3Cases = Math.max(1, activeCasesCount - z1Cases - z2Cases);

  const distBase = region.distanceKm ? Math.max(1.0, region.distanceKm) : 1.4;

  const heatZones: HeatZone[] = [
    {
      id: `z1-${region.id}`,
      x: 65 + (seed % 12) - 6,
      y: 30 + ((seed >> 2) % 12) - 6,
      radius: 90,
      intensity: z1Cases >= 6 ? 'high' : 'moderate',
      areaName: `${region.name} East Belt`,
      areaNameHi: `${region.nameHi || region.name} पूर्वी क्षेत्र`,
      areaNameMr: `${region.nameMr} पूर्व पट्टा`,
      crop: cropName,
      reportedCases: z1Cases,
      distanceKm: Math.round((distBase * 0.8 + 0.5) * 10) / 10,
    },
    {
      id: `z2-${region.id}`,
      x: 28 + ((seed >> 4) % 12) - 6,
      y: 64 + ((seed >> 6) % 12) - 6,
      radius: 75,
      intensity: z2Cases >= 5 ? 'high' : 'moderate',
      areaName: `${region.name} Ridge Sector`,
      areaNameHi: `${region.nameHi || region.name} रिज सेक्टर`,
      areaNameMr: `${region.nameMr} परिसर`,
      crop: cropName,
      reportedCases: z2Cases,
      distanceKm: Math.round((distBase * 1.5 + 1.2) * 10) / 10,
    },
    {
      id: `z3-${region.id}`,
      x: 72 + ((seed >> 8) % 10) - 5,
      y: 74 + ((seed >> 10) % 10) - 5,
      radius: 65,
      intensity: 'low',
      areaName: `${region.name} River Belt`,
      areaNameHi: `${region.nameHi || region.name} नदी बेल्ट`,
      areaNameMr: `${region.nameMr} नदी पट्टा`,
      crop: cropName,
      reportedCases: z3Cases,
      distanceKm: Math.round((distBase * 2.1 + 2.0) * 10) / 10,
    },
  ];

  const advisory = `KVK ${region.district} Advisory: ${advisoryTemplate.en}`;
  const advisoryHi = `${region.districtHi || region.district} केवीके सलाह: ${advisoryTemplate.hi}`;
  const advisoryMr = `${region.districtMr || region.district} केव्हीके सल्ला: ${advisoryTemplate.mr}`;

  return {
    id: region.id,
    name: region.name,
    nameHi: region.nameHi || region.name,
    nameMr: region.nameMr || region.name,
    taluka: region.taluka,
    district: region.district,
    districtHi: region.districtHi || region.district,
    districtMr: region.districtMr || region.district,
    status,
    activeCasesCount,
    diseaseTrend,
    lastUpdated: '15 mins ago',
    advisory,
    advisoryHi,
    advisoryMr,
    heatZones,
  };
}
