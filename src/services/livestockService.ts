import type { LivestockAnimal, AnimalSpecies, AnimalHealthStatus, AnimalGender } from '../types';
import { apiClient } from './apiClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './authService';
import { SEEDED_DEMO_HERD } from './mockData';

const LOCAL_STORAGE_HERD_KEY = 'pashu_sarthak_user_herd_v1';

export const livestockService = {
  getStoredHerd(ownerId?: string): LivestockAnimal[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_HERD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (ownerId) {
            const matched = parsed.filter((a: LivestockAnimal) => a.ownerId === ownerId);
            if (matched.length > 0) return matched;
          }
          return parsed;
        }
      }
    } catch {}
    return SEEDED_DEMO_HERD;
  },

  saveStoredHerd(herd: LivestockAnimal[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_HERD_KEY, JSON.stringify(herd));
    } catch {}
  },

  async getHerdByOwner(ownerId: string): Promise<LivestockAnimal[]> {
    // 1. Try Backend API
    try {
      const res = await apiClient<{ success: boolean; data: LivestockAnimal[] }>(`/farms/owner/${ownerId}/animals`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.saveStoredHerd(res.data);
        return res.data;
      }
    } catch {}

    // 2. Direct Supabase Fallback
    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/livestock?owner_id=eq.${ownerId}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });
      if (supaRes.ok) {
        const data = await supaRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: LivestockAnimal[] = data.map((d: any) => ({
            id: d.id,
            ownerId: d.owner_id || ownerId,
            tagNumber: d.tag_number || `TAG-${d.id.slice(0, 6)}`,
            name: d.name || 'Animal',
            species: d.species || 'cattle',
            breed: d.breed || 'Indigenous',
            ageYears: d.age_years ?? 3,
            ageMonths: d.age_months ?? 0,
            gender: d.gender || 'female',
            count: d.count ?? 1,
            healthStatus: d.health_status || 'healthy',
            lastVaccinationDate: d.last_vaccination_date,
            nextVaccinationDue: d.next_vaccination_due,
            recentCondition: d.recent_condition,
            notes: d.notes,
            createdAt: d.created_at,
          }));
          this.saveStoredHerd(mapped);
          return mapped;
        }
      }
    } catch {}

    // 3. Local storage & seeded demo fallback
    return this.getStoredHerd(ownerId);
  },

  async addAnimal(payload: {
    ownerId: string;
    tagNumber: string;
    name: string;
    species: AnimalSpecies;
    breed: string;
    ageYears?: number;
    ageMonths?: number;
    gender: AnimalGender;
    count?: number;
    healthStatus?: AnimalHealthStatus;
    notes?: string;
  }): Promise<LivestockAnimal> {
    const newAnimal: LivestockAnimal = {
      id: `animal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ownerId: payload.ownerId,
      tagNumber: payload.tagNumber || `MH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      name: payload.name || 'New Animal',
      species: payload.species,
      breed: payload.breed || 'Indigenous',
      ageYears: payload.ageYears ?? 2,
      ageMonths: payload.ageMonths ?? 0,
      gender: payload.gender || 'female',
      count: payload.count ?? 1,
      healthStatus: payload.healthStatus || 'healthy',
      notes: payload.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Update Local Storage
    const existing = this.getStoredHerd();
    const updated = [newAnimal, ...existing];
    this.saveStoredHerd(updated);

    // Try Supabase insert
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/livestock`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          id: newAnimal.id,
          owner_id: newAnimal.ownerId,
          tag_number: newAnimal.tagNumber,
          name: newAnimal.name,
          species: newAnimal.species,
          breed: newAnimal.breed,
          age_years: newAnimal.ageYears,
          age_months: newAnimal.ageMonths,
          gender: newAnimal.gender,
          count: newAnimal.count,
          health_status: newAnimal.healthStatus,
          notes: newAnimal.notes,
        }),
      });
    } catch {}

    return newAnimal;
  },

  async updateAnimal(animalId: string, updates: Partial<LivestockAnimal>): Promise<LivestockAnimal | null> {
    const existing = this.getStoredHerd();
    let updatedAnimal: LivestockAnimal | null = null;

    const updatedList = existing.map((a) => {
      if (a.id === animalId) {
        updatedAnimal = { ...a, ...updates };
        return updatedAnimal;
      }
      return a;
    });

    if (updatedAnimal) {
      this.saveStoredHerd(updatedList);
    }
    return updatedAnimal;
  },

  async deleteAnimal(animalId: string): Promise<boolean> {
    const existing = this.getStoredHerd();
    const filtered = existing.filter((a) => a.id !== animalId);
    this.saveStoredHerd(filtered);
    return true;
  },
};
