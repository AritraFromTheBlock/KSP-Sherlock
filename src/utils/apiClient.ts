import { auth } from '../config/firebase';

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Reusable HTTP client that automatically attaches a Firebase ID Token.
 * NOTE: The token is sent as X-Firebase-Token (not Authorization: Bearer) because
 * Zoho Catalyst's API Gateway intercepts the Authorization header and validates it
 * as a Catalyst/Zoho session token — a Firebase JWT will always fail that check (401).
 * Sending as a custom header bypasses the gateway validator; the Catalyst function
 * code can still verify the Firebase token server-side if needed.
 */
export async function apiFetch<T = any>(
  url: string, 
  options: ApiFetchOptions = {}
): Promise<T> {
  const { timeoutMs = 30000, skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(customHeaders as Record<string, string>),
  };

  // Attach Firebase ID Token as a custom header (not Authorization: Bearer).
  // Catalyst's gateway validates Authorization as a Zoho token and rejects Firebase JWTs.
  if (!skipAuth) {
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          headers['X-Firebase-Token'] = token;
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve Firebase access token for API request:', err);
    }
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      if (typeof errorData === 'object' && errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }

      if (response.status === 401) {
        errorMessage = 'Unauthorized: Invalid or expired session token. Please sign in again.';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to access this resource.';
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection and try again.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network request failed', 0);
  }
}

export const apiClient = {
  get: <T = any>(url: string, options?: ApiFetchOptions) => 
    apiFetch<T>(url, { ...options, method: 'GET' }),
    
  post: <T = any>(url: string, body?: any, options?: ApiFetchOptions) => 
    apiFetch<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    
  put: <T = any>(url: string, body?: any, options?: ApiFetchOptions) => 
    apiFetch<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    
  delete: <T = any>(url: string, options?: ApiFetchOptions) => 
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};
