import type { VaccinationRecord, AnimalSpecies } from '../types';
import { apiClient } from './apiClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './authService';
import { SEEDED_DEMO_VACCINATIONS } from './mockData';

const LOCAL_STORAGE_VAC_KEY = 'pashu_sarthak_user_vaccines_v1';

export const vaccinationService = {
  getStoredVaccines(): VaccinationRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_VAC_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return SEEDED_DEMO_VACCINATIONS;
  },

  saveStoredVaccines(records: VaccinationRecord[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_VAC_KEY, JSON.stringify(records));
    } catch {}
  },

  async getVaccinationsForHerd(_animalIds?: string[]): Promise<VaccinationRecord[]> {
    // 1. Try Backend API
    try {
      const res = await apiClient<{ success: boolean; data: VaccinationRecord[] }>('/farms/vaccinations');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.saveStoredVaccines(res.data);
        return res.data;
      }
    } catch {}

    // 2. Direct Supabase Fallback
    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/vaccination_records?select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });
      if (supaRes.ok) {
        const data = await supaRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: VaccinationRecord[] = data.map((d: any) => ({
            id: d.id,
            animalId: d.animal_id,
            animalName: d.animal_name || 'Livestock',
            species: d.species || 'cattle',
            vaccineName: d.vaccine_name,
            diseaseTarget: d.disease_target || d.vaccine_name,
            administeredDate: d.administered_date,
            nextDueDate: d.next_due_date,
            status: d.status || 'completed',
            batchNumber: d.batch_number,
            veterinarian: d.veterinarian,
            notes: d.notes,
          }));
          this.saveStoredVaccines(mapped);
          return mapped;
        }
      }
    } catch {}

    return this.getStoredVaccines();
  },

  async addVaccineRecord(payload: {
    animalId: string;
    animalName: string;
    species: AnimalSpecies;
    vaccineName: string;
    diseaseTarget: string;
    administeredDate: string;
    nextDueDate?: string;
    batchNumber?: string;
    veterinarian?: string;
    notes?: string;
  }): Promise<VaccinationRecord> {
    // Calculate due date if not provided (default 6 months booster)
    let calculatedDueDate = payload.nextDueDate;
    if (!calculatedDueDate) {
      const adminDate = new Date(payload.administeredDate || Date.now());
      adminDate.setMonth(adminDate.getMonth() + 6);
      calculatedDueDate = adminDate.toISOString().split('T')[0];
    }

    const today = new Date().toISOString().split('T')[0];
    let status: 'completed' | 'due_soon' | 'overdue' = 'completed';
    if (calculatedDueDate < today) {
      status = 'overdue';
    } else {
      const diffDays = (new Date(calculatedDueDate).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24);
      if (diffDays <= 15) {
        status = 'due_soon';
      }
    }

    const newRecord: VaccinationRecord = {
      id: `vac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      animalId: payload.animalId,
      animalName: payload.animalName,
      species: payload.species,
      vaccineName: payload.vaccineName,
      diseaseTarget: payload.diseaseTarget,
      administeredDate: payload.administeredDate || today,
      nextDueDate: calculatedDueDate,
      status,
      batchNumber: payload.batchNumber,
      veterinarian: payload.veterinarian || 'Veterinary Officer',
      notes: payload.notes,
    };

    const existing = this.getStoredVaccines();
    const updated = [newRecord, ...existing];
    this.saveStoredVaccines(updated);

    // Try Supabase insert
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/vaccination_records`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newRecord.id,
          animal_id: newRecord.animalId,
          animal_name: newRecord.animalName,
          species: newRecord.species,
          vaccine_name: newRecord.vaccineName,
          disease_target: newRecord.diseaseTarget,
          administered_date: newRecord.administeredDate,
          next_due_date: newRecord.nextDueDate,
          status: newRecord.status,
          batch_number: newRecord.batchNumber,
          veterinarian: newRecord.veterinarian,
          notes: newRecord.notes,
        }),
      });
    } catch {}

    return newRecord;
  },
};
