// Centralized API Client for Melodify

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Resolves the base URL depending on whether the code is running
 * on the client (browser) or server (SSR).
 * In browser, '/api' routes through Next.js rewrites to the backend,
 * ensuring automatic cookie handling without CORS restrictions.
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  const internal = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  return `${internal}/api`;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let url = `${baseUrl}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(restOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...((headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
      credentials: 'include', // Ensures cookies (Token) are forwarded
    });

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg =
        (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string')
          ? (data as { message: string }).message
          : `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Network error occurred';
    throw new ApiError(message, 0, null);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  postFormData: <T>(endpoint: string, formData: FormData, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    }),
};
