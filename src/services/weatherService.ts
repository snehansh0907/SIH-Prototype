import type { WeatherCondition } from '../types';
import { apiClient } from './apiClient';
import { MOCK_WEATHER } from './mockData';

export const weatherService = {
  async getWeatherContext(location: string = 'Nashik'): Promise<WeatherCondition> {
    try {
      return await apiClient<WeatherCondition>(`/weather?location=${encodeURIComponent(location)}`);
    } catch {
      return MOCK_WEATHER;
    }
  }
};
