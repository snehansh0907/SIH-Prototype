import { apiClient } from './apiClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY, getLocalRegisteredUsers } from './authService';

export interface BackendFarm {
  id: string;
  farmer_id: string;
  farm_name: string;
  latitude: number;
  longitude: number;
  village?: string;
  taluka?: string;
  district?: string;
  area_acres?: number;
  variety?: string;
  crop_stage?: string;
  created_at?: string;
}

export interface BackendCropCycle {
  id: string;
  farm_id: string;
  crop_name: string;
  variety?: string;
  sowing_date?: string;
  crop_stage?: string;
  status?: string;
  created_at?: string;
}

export const SEEDED_DEMO_FARMER_ID = '542d3fbc-f0f7-4e82-84b9-f8394659b61b';
export const SEEDED_DEMO_FARM_ID = '17e5475b-6ec1-4473-9c56-9e7de02d63d9';

export const SEEDED_DEMO_CROP_CYCLES: Record<string, string> = {
  tomato: '30dd71a7-0230-4492-8fd8-42d7a53af3a1',
  cotton: 'c0867699-a20f-4293-a2c7-2a1d93b915e4',
  soybean: '23114716-38fc-493d-b823-0f80e3e8aef6',
};

export const SEEDED_FARMS: BackendFarm[] = [
  {
    id: SEEDED_DEMO_FARM_ID,
    farmer_id: SEEDED_DEMO_FARMER_ID,
    farm_name: "Ramesh's Niphad Plot",
    latitude: 20.156556,
    longitude: 74.117339,
    village: 'Niphad',
    taluka: 'Niphad',
    district: 'Nashik',
    area_acres: 3.29,
  },
  {
    id: 'f2-dindori-plot',
    farmer_id: SEEDED_DEMO_FARMER_ID,
    farm_name: "Ramesh's Dindori Hill Orchard",
    latitude: 20.1741,
    longitude: 73.8322,
    village: 'Dindori',
    taluka: 'Dindori',
    district: 'Nashik',
    area_acres: 2.15,
  },
  {
    id: '46b37fe5-aedb-4e2c-bb26-a4e8b1dae26a',
    farmer_id: 'd53fc6d1-cca3-4c91-8c61-b32029cc231e',
    farm_name: "Vikas's Chandori Farm",
    latitude: 20.0797,
    longitude: 74.0322,
    village: 'Chandori',
    taluka: 'Niphad',
    district: 'Nashik',
    area_acres: 3.51,
  },
  {
    id: '6e5c646e-53f8-4be4-a731-13ed3de4f3d0',
    farmer_id: '6ecf18a7-f888-4ba6-9b7c-c43253a0409c',
    farm_name: "Anita's Ozar Farm",
    latitude: 20.0927,
    longitude: 73.9189,
    village: 'Ozar',
    taluka: 'Niphad',
    district: 'Nashik',
    area_acres: 2.45,
  },
];

export const farmService = {
  async getFarmsByFarmer(farmerId: string = SEEDED_DEMO_FARMER_ID): Promise<BackendFarm[]> {
    // 1. Try Backend Express API
    try {
      const res = await apiClient<{ success: boolean; data: BackendFarm[] }>(`/farms/farmer/${farmerId}`);
      if (res.data && res.data.length > 0) return res.data;
    } catch {}

    // 2. Direct Supabase REST Fallback
    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/farms?farmer_id=eq.${farmerId}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });
      if (supaRes.ok) {
        const data = await supaRes.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}

    // 3. Check locally registered users for real farmer profile
    const localUser = getLocalRegisteredUsers().find((u) => u.id === farmerId || u.farmerId === farmerId);
    if (localUser && localUser.farmName) {
      return [{
        id: localUser.farmId || `farm-${localUser.id}`,
        farmer_id: localUser.id,
        farm_name: localUser.farmName,
        latitude: localUser.latitude ?? 20.085,
        longitude: localUser.longitude ?? 74.11,
        village: localUser.village,
        taluka: localUser.taluka,
        district: localUser.district,
        area_acres: typeof localUser.areaAcres === 'number' ? localUser.areaAcres : parseFloat(String(localUser.areaAcres || '2.5')),
      }];
    }

    // 4. Check seeded demo farms for demo accounts
    const matched = SEEDED_FARMS.filter((f) => f.farmer_id === farmerId);
    if (matched.length > 0) return matched;

    // Only return Ramesh Patil's farm if explicitly requesting Ramesh's demo ID
    if (farmerId === SEEDED_DEMO_FARMER_ID || farmerId === 'farmer123') {
      return [SEEDED_FARMS[0]];
    }

    // For non-demo farmers, never return Ramesh's farm
    return [];
  },

  async getFarmById(id: string = SEEDED_DEMO_FARM_ID): Promise<BackendFarm | null> {
    // 1. Check locally registered users
    const localUserWithFarm = getLocalRegisteredUsers().find((u) => u.farmId === id || `farm-${u.id}` === id);
    if (localUserWithFarm && localUserWithFarm.farmName) {
      return {
        id: localUserWithFarm.farmId || id,
        farmer_id: localUserWithFarm.id,
        farm_name: localUserWithFarm.farmName,
        latitude: localUserWithFarm.latitude ?? 20.085,
        longitude: localUserWithFarm.longitude ?? 74.11,
        village: localUserWithFarm.village,
        taluka: localUserWithFarm.taluka,
        district: localUserWithFarm.district,
        area_acres: typeof localUserWithFarm.areaAcres === 'number' ? localUserWithFarm.areaAcres : parseFloat(String(localUserWithFarm.areaAcres || '2.5')),
      };
    }

    try {
      const res = await apiClient<{ success: boolean; data: BackendFarm }>(`/farms/${id}`);
      if (res.data) return res.data;
    } catch {}

    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/farms?id=eq.${id}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });
      if (supaRes.ok) {
        const data = await supaRes.json();
        if (Array.isArray(data) && data.length > 0) return data[0];
      }
    } catch {}

    const found = SEEDED_FARMS.find((f) => f.id === id);
    if (found) return found;

    if (id === SEEDED_DEMO_FARM_ID) {
      return SEEDED_FARMS[0];
    }
    return null;
  },

  async getCropCyclesByFarm(farmId: string = SEEDED_DEMO_FARM_ID): Promise<BackendCropCycle[]> {
    // 1. Check locally registered users for active crop cycle
    const localUserWithFarm = getLocalRegisteredUsers().find(
      (u) => u.farmId === farmId || `farm-${u.id}` === farmId || u.id === farmId
    );
    if (localUserWithFarm && localUserWithFarm.monitoredCrop) {
      return [
        {
          id: localUserWithFarm.cropCycleId || `cycle-${localUserWithFarm.id}`,
          farm_id: farmId,
          crop_name: localUserWithFarm.monitoredCrop,
          variety: 'Selected',
          crop_stage: 'vegetative',
          status: 'active',
        },
      ];
    }

    try {
      const res = await apiClient<{ success: boolean; data: BackendCropCycle[] }>(`/crop-cycles/farm/${farmId}`);
      if (res.data && res.data.length > 0) return res.data;
    } catch {}

    try {
      const supaRes = await fetch(
        `${SUPABASE_URL}/rest/v1/crop_cycles?farm_id=eq.${farmId}&status=eq.active&select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Accept: 'application/json',
          },
        }
      );
      if (supaRes.ok) {
        const data = await supaRes.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}

    if (farmId === SEEDED_DEMO_FARM_ID) {
      return [
        {
          id: SEEDED_DEMO_CROP_CYCLES.tomato,
          farm_id: farmId,
          crop_name: 'Tomato',
          variety: 'Abhinav',
          crop_stage: 'seedling',
          status: 'active',
        },
      ];
    }
    return [];
  },

  async createFarm(payload: {
    farmer_id: string;
    farm_name: string;
    latitude: number;
    longitude: number;
    village?: string;
    taluka?: string;
    district?: string;
    area_acres?: number;
  }): Promise<BackendFarm | null> {
    try {
      const res = await apiClient<{ success: boolean; data: BackendFarm }>('/farms', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data || null;
    } catch {
      // Fallback: Direct Supabase REST insert
      try {
        const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/farms`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(payload),
        });
        if (supaRes.ok) {
          const data = await supaRes.json();
          return Array.isArray(data) ? data[0] : data;
        }
      } catch {}
      return null;
    }
  },

  getCropCycleIdForCrop(cropId: string): string {
    const key = cropId.toLowerCase();
    return SEEDED_DEMO_CROP_CYCLES[key] || SEEDED_DEMO_CROP_CYCLES.tomato;
  },
};
