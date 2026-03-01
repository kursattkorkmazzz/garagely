import { ErrorCode } from "@garagely/shared/error.codes";
import type { ApiResponse, ErrorResponse } from "@garagely/shared/response.types";
import type { HttpClient, SdkConfig, SdkError } from "./types";

function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === false
  );
}

export function createHttpClient(config: SdkConfig): HttpClient {
  let authToken: string | null = null;

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

    const options: RequestInit = {
      method,
      headers: getHeaders(isFormData),
    };

    if (body !== undefined) {
      options.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      const sdkError: SdkError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Network error. Please check your connection.",
      };
      throw sdkError;
    }

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

    setAuthToken(token: string | null): void {
      authToken = token;
    },
  };
}
