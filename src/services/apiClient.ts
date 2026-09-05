/**
 * Centralized API Client for Krishi Sarthak
 * Configurable via environment variable NEXT_PUBLIC_API_URL or VITE_API_URL
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 8000, ...customConfig } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customConfig.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText} (${response.status})`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(id);
    // If backend is unreachable or timed out, log and rethrow so services can safely fallback to rich mock data
    console.warn(`[Krishi Sarthak API] Request to ${endpoint} failed, falling back to local agricultural engine:`, error.message);
    throw error;
  }
}
