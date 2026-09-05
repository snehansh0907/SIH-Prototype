import type { RiskForecast } from '../types';
import { apiClient } from './apiClient';
import { MOCK_RISK_FORECAST } from './mockData';

export const riskService = {
  async getRiskForecast(cropId: string = 'tomato'): Promise<RiskForecast> {
    try {
      return await apiClient<RiskForecast>(`/risk?cropId=${cropId}`);
    } catch {
      return {
        ...MOCK_RISK_FORECAST,
        cropId
      };
    }
  }
};
