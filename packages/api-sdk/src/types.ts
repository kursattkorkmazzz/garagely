import type { ErrorCode } from "@garagely/shared/error.codes";
import type { PaginatedData } from "@garagely/shared/response.types";

export interface SdkConfig {
  baseUrl: string;
  /** Request timeout in milliseconds. Default: 30000 (30 seconds) */
  timeout?: number;
}

export interface SdkError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface SdkCallbacks<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: SdkError) => void;
}

export interface SdkPaginatedCallbacks<T> {
  onSuccess?: (data: PaginatedData<T>) => void;
  onError?: (error: SdkError) => void;
}

export interface RequestOptions {
  method: string;
  path: string;
  body?: unknown;
  isFormData?: boolean;
  key?: string;
}

export interface HttpClient {
  get<T>(path: string, key?: string): CancelableRequest<T>;
  post<T>(path: string, body?: unknown, key?: string): CancelableRequest<T>;
  patch<T>(path: string, body?: unknown, key?: string): CancelableRequest<T>;
  delete<T>(path: string, key?: string): CancelableRequest<T>;
  postFormData<T>(path: string, formData: FormData, key?: string): CancelableRequest<T>;
  patchFormData<T>(path: string, formData: FormData, key?: string): CancelableRequest<T>;
  setAuthToken(token: string | null): void;
}

export type CancelableRequest<T> = {
  request: Promise<T>;
  cancel: () => void;
};
