import { apiClient } from './apiClient';

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

export const farmService = {
  async getFarmsByFarmer(farmerId: string = SEEDED_DEMO_FARMER_ID): Promise<BackendFarm[]> {
    try {
      const res = await apiClient<{ success: boolean; data: BackendFarm[] }>(`/farms/farmer/${farmerId}`);
      return res.data || [];
    } catch {
      return [
        {
          id: SEEDED_DEMO_FARM_ID,
          farmer_id: farmerId,
          farm_name: "Ramesh's Farm",
          latitude: 20.156556,
          longitude: 74.117339,
          village: 'Niphad',
          taluka: 'Niphad',
          district: 'Nashik',
          area_acres: 3.29,
        },
      ];
    }
  },

  async getFarmById(id: string = SEEDED_DEMO_FARM_ID): Promise<BackendFarm | null> {
    try {
      const res = await apiClient<{ success: boolean; data: BackendFarm }>(`/farms/${id}`);
      return res.data || null;
    } catch {
      return {
        id,
        farmer_id: SEEDED_DEMO_FARMER_ID,
        farm_name: "Ramesh's Farm",
        latitude: 20.156556,
        longitude: 74.117339,
        village: 'Niphad',
        taluka: 'Niphad',
        district: 'Nashik',
        area_acres: 3.29,
      };
    }
  },

  async getCropCyclesByFarm(farmId: string = SEEDED_DEMO_FARM_ID): Promise<BackendCropCycle[]> {
    try {
      const res = await apiClient<{ success: boolean; data: BackendCropCycle[] }>(`/crop-cycles/farm/${farmId}`);
      return res.data || [];
    } catch {
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
  },

  getCropCycleIdForCrop(cropId: string): string {
    const key = cropId.toLowerCase();
    return SEEDED_DEMO_CROP_CYCLES[key] || SEEDED_DEMO_CROP_CYCLES.tomato;
  },
};
