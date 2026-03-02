import { ErrorCode } from "@garagely/shared/error.codes";
import type {
  ApiResponse,
  ErrorResponse,
} from "@garagely/shared/response.types";
import type { HttpClient, SdkConfig, SdkError } from "./types";

function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === false
  );
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export function createHttpClient(config: SdkConfig): HttpClient {
  let authToken: string | null = null;
  const timeout = config.timeout ?? DEFAULT_TIMEOUT;

  function getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    isFormData = false,
  ): Promise<T> {
    const url = `${config.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const options: RequestInit = {
      method,
      headers: getHeaders(isFormData),
      signal: controller.signal,
    };

    if (body !== undefined) {
      options.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        const sdkError: SdkError = {
          code: ErrorCode.REQUEST_TIMEOUT,
          message: "Request timed out. Please try again.",
        };
        throw sdkError;
      }

      const sdkError: SdkError = {
        code: ErrorCode.NETWORK_ERROR,
        message: "Network error. Please check your connection.",
      };
      throw sdkError;
    }

    clearTimeout(timeoutId);

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      const sdkError: SdkError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Invalid response from server.",
      };
      throw sdkError;
    }

    if (isErrorResponse(data)) {
      const sdkError: SdkError = {
        code: data.error.code,
        message: data.error.message,
        details: data.error.details,
      };
      throw sdkError;
    }

    return (data as ApiResponse<T>).data;
  }

  return {
    get<T>(path: string): Promise<T> {
      return request<T>("GET", path);
    },

    post<T>(path: string, body?: unknown): Promise<T> {
      return request<T>("POST", path, body);
    },

    patch<T>(path: string, body?: unknown): Promise<T> {
      return request<T>("PATCH", path, body);
    },

    delete<T>(path: string): Promise<T> {
      return request<T>("DELETE", path);
    },

    postFormData<T>(path: string, formData: FormData): Promise<T> {
      return request<T>("POST", path, formData, true);
    },

    patchFormData<T>(path: string, formData: FormData): Promise<T> {
      return request<T>("PATCH", path, formData, true);
    },

    setAuthToken(token: string | null): void {
      authToken = token;
    },
  };
}
