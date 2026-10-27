import { ApiResponse } from '../types/ApiResponse';

// Normalize API base URL: handle trailing slashes and ensure /api path
let rawBase = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
if (/^https?:\/\//i.test(rawBase) && !rawBase.endsWith('/api')) {
  rawBase += '/api';
}
const BASE_URL = rawBase;

export class ApiErrorResponse extends Error {
  code: string;
  details?: Array<{ field: string; message: string }>;
  status: number;

  constructor(status: number, code: string, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiErrorResponse.prototype);
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      credentials: 'include', // Always include HttpOnly cookies
    });
  } catch (err: any) {
    throw new ApiErrorResponse(
      0,
      'NETWORK_ERROR',
      'Unable to connect to the server. Please verify the backend is running.'
    );
  }

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch (err) {
    throw new ApiErrorResponse(response.status, 'PARSE_ERROR', 'Failed to parse server response');
  }

  if (!response.ok || !data.success) {
    const code = data?.error?.code || 'REQUEST_FAILED';
    const message = data?.error?.message || response.statusText || 'Request failed';
    const details = data?.error?.details;
    throw new ApiErrorResponse(response.status, code, message, details);
  }

  return data.data;
}
