export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: ApiError;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
