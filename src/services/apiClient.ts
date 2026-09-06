/**
 * Centralized API Client for Krishi Sarthak
 * Configurable via environment variable NEXT_PUBLIC_API_URL or VITE_API_URL
 */

export const BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:5000/api';
export const API_ROOT_URL = BASE_URL.replace(/\/api\/?$/, '');

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 12000, ...customConfig } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const isFormData = typeof FormData !== 'undefined' && customConfig.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...customConfig.headers,
    },
    signal: controller.signal,
  };

  if (isFormData && config.headers) {
    // Ensure Content-Type is completely omitted for FormData so browser computes multipart boundary
    if (config.headers instanceof Headers) {
      config.headers.delete('Content-Type');
    } else if (typeof config.headers === 'object') {
      delete (config.headers as Record<string, string>)['Content-Type'];
      delete (config.headers as Record<string, string>)['content-type'];
    }
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
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
