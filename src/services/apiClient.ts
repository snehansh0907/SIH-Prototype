/**
 * Centralized API Client for Pashu Sarthak
 * Configurable via environment variable NEXT_PUBLIC_API_URL or VITE_API_URL
 */

export const BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:5001/api';
export const API_ROOT_URL = BASE_URL.replace(/\/api\/?$/, '');

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultTimeout = isFormData ? 45000 : 15000;
  const { timeout = defaultTimeout, ...customConfig } = options;

  let isTimedOut = false;
  const controller = new AbortController();
  const id = setTimeout(() => {
    isTimedOut = true;
    try {
      controller.abort(new DOMException('Request timed out', 'TimeoutError'));
    } catch {
      controller.abort();
    }
  }, timeout);

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

  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${cleanBase}${cleanEndpoint}`;

  try {
    const response = await fetch(url, config);
    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || `API error: ${response.statusText} (${response.status})`;
      const err: any = new Error(errorMsg);
      err.status = response.status;
      err.data = errorData;
      err.isApiError = true;
      throw err;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(id);

    // 1. Sanitize Abort / Timeout errors - NEVER leak "signal is aborted without reason"
    const isAbort =
      isTimedOut ||
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      controller.signal.aborted ||
      /abort|timed out|timeout|signal is aborted/i.test(error.message || '');

    if (isAbort) {
      console.error(`[Pashu Sarthak API] Request to ${endpoint} timed out after ${timeout}ms. Original error:`, error);
      const friendlyTimeoutErr: any = new Error(
        'The diagnosis server took too long to respond. Please check your connection and try again.'
      );
      friendlyTimeoutErr.name = 'TimeoutError';
      friendlyTimeoutErr.isNetworkError = true;
      throw friendlyTimeoutErr;
    }

    // 2. If port 5001/5000 failed with connection error (not timeout), attempt alternate port fallback
    if (!endpoint.startsWith('http') && (!error.status || error.name === 'TypeError')) {
      const altUrl = url.includes(':5001')
        ? url.replace(':5001', ':5000')
        : url.includes(':5000')
        ? url.replace(':5000', ':5001')
        : null;

      if (altUrl) {
        try {
          const retryController = new AbortController();
          const retryId = setTimeout(() => {
            try { retryController.abort(); } catch {}
          }, 4000);
          const altResponse = await fetch(altUrl, { ...config, signal: retryController.signal });
          clearTimeout(retryId);
          if (altResponse.ok) {
            return (await altResponse.json()) as T;
          }
        } catch {}
      }
    }

    // 3. Sanitize Connection / Network errors
    const isNetworkError =
      !error.status &&
      (error.name === 'TypeError' ||
        /NetworkError|Failed to fetch|network|econnrefused/i.test(error.message || ''));

    if (isNetworkError) {
      console.error(`[Pashu Sarthak API] Network connection failed for ${endpoint}. Original error:`, error);
      const friendlyNetErr: any = new Error(
        'Unable to reach the diagnosis server. Please ensure the backend is running.'
      );
      friendlyNetErr.name = 'ConnectionError';
      friendlyNetErr.isNetworkError = true;
      throw friendlyNetErr;
    }

    if (/signal is aborted/i.test(error.message || '')) {
      const sanitizedErr: any = new Error('The diagnosis request was interrupted. Please try again.');
      sanitizedErr.name = 'AbortError';
      throw sanitizedErr;
    }

    if (!endpoint.includes('/auth')) {
      console.warn(`[Pashu Sarthak API] Request to ${endpoint} failed:`, error.message);
    } else {
      console.warn(`[Pashu Sarthak API] Authentication request to ${endpoint} failed:`, error.message);
    }
    throw error;
  }
}
