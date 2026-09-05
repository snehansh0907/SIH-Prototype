import type { AreaReport } from '../types';
import { apiClient } from './apiClient';
import { MOCK_AREA_REPORT } from './mockData';

export const hotspotService = {
  async getAreaReport(district: string = 'Nashik'): Promise<AreaReport> {
    try {
      return await apiClient<AreaReport>(`/hotspots?district=${encodeURIComponent(district)}`);
    } catch {
      return MOCK_AREA_REPORT;
    }
  }
};
