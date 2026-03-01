import type { ErrorCode } from "@garagely/shared/error.codes";

export interface SdkConfig {
  baseUrl: string;
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

export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
  postFormData<T>(path: string, formData: FormData): Promise<T>;
  setAuthToken(token: string | null): void;
}
