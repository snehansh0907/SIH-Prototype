import { apiClient } from './apiClient';

export interface BackendAdvisory {
  status: 'LOW' | 'MODERATE' | 'HIGH' | string;
  what_to_do_today: string[];
  what_to_monitor: string[];
  prevention: string[];
  expert_help_required: boolean;
  disease_info?: {
    disease_name: string;
    scientific_name: string;
    description: string;
    how_it_spreads?: string[];
    safe_dosage?: string[];
    ipm_priority_order?: string[];
  };
}

export const advisoryService = {
  async getAdvisory(caseId: string): Promise<BackendAdvisory | null> {
    try {
      const res = await apiClient<{ success: boolean; data: BackendAdvisory }>(`/advisory/${caseId}`);
      return res.data || null;
    } catch {
      return null;
    }
  },
};
