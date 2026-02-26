import type { ErrorCode } from './error.codes';

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export type ApiResult<T = unknown> = ApiResponse<T> | ErrorResponse;
export type PaginatedResult<T = unknown> = PaginatedResponse<T> | ErrorResponse;
