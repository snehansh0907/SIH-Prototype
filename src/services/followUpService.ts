import { apiClient } from './apiClient';
import type { FollowUpStatus } from '../types';
import { SEEDED_DEMO_FARMER_ID } from './farmService';

export interface FollowUpRecord {
  id: string;
  case_id: string;
  farmer_id?: string;
  status: FollowUpStatus;
  notes?: string;
  new_image_url?: string;
  created_at?: string;
}

export const followUpService = {
  /**
   * Submit recovery status for an existing diagnosis case.
   * POST /api/follow-ups
   */
  async createFollowUp(data: {
    case_id: string;
    farmer_id?: string;
    status: FollowUpStatus;
    notes?: string;
    new_image_url?: string;
  }): Promise<{ success: boolean; data?: any; recommendation?: string | null }> {
    try {
      const payload = {
        ...data,
        farmer_id: data.farmer_id || SEEDED_DEMO_FARMER_ID,
      };

      const res = await apiClient<{
        success: boolean;
        data: { follow_up: FollowUpRecord; recommendation: string | null };
      }>('/follow-ups', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        data: res.data?.follow_up,
        recommendation: res.data?.recommendation,
      };
    } catch (err) {
      console.warn('[followUpService] Failed to submit follow-up to backend, saved in local session:', err);
      return { success: false };
    }
  },

  /**
   * Fetch all follow-up history for a case.
   * GET /api/follow-ups/:caseId
   */
  async getFollowUpsByCase(caseId: string): Promise<FollowUpRecord[]> {
    try {
      const res = await apiClient<{ success: boolean; data: FollowUpRecord[] }>(`/follow-ups/${caseId}`);
      return res.data || [];
    } catch {
      return [];
    }
  },
};
