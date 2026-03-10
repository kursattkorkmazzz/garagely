import { ErrorCode } from "@garagely/shared/error.codes";
import type {
  ApiResponse,
  ErrorResponse,
} from "@garagely/shared/response.types";
import type {
  CancelableRequest,
  HttpClient,
  RequestOptions,
  SdkConfig,
  SdkError,
} from "./types";

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

  // To prevent the race condition, we track the keyed requests.
  const activeRequest: Map<string, AbortController> = new Map();

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

  function request<T>(options: RequestOptions): CancelableRequest<T> {
    const controller = new AbortController();

    if (options.key) {
      activeRequest.get(options.key)?.abort();
      activeRequest.set(options.key, controller);
    }

    const reqPromise = (async () => {
      const url = `${config.baseUrl}${options.path}`;

      const requestInit: RequestInit = {
        method: options.method,
        headers: getHeaders(options.isFormData ?? false),
        signal: controller.signal,
      };
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      if (options.body !== undefined) {
        requestInit.body = options.isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body);
      }

      let response: Response;
      try {
        response = await fetch(url, requestInit);
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
    })();

    return {
      request: reqPromise,
      cancel: () => controller.abort(),
    };
  }

  return {
    get<T>(path: string, key?: string): CancelableRequest<T> {
      return request<T>({
        method: "GET",
        path,
        key,
      });
    },

    post<T>(path: string, body?: unknown, key?: string): CancelableRequest<T> {
      return request<T>({
        method: "POST",
        path,
        body,
        key,
      });
    },

    patch<T>(path: string, body?: unknown, key?: string): CancelableRequest<T> {
      return request<T>({
        method: "PATCH",
        path,
        body,
        key,
      });
    },

    delete<T>(path: string, key?: string): CancelableRequest<T> {
      return request<T>({
        method: "DELETE",
        path,
        key,
      });
    },

    postFormData<T>(
      path: string,
      formData: FormData,
      key?: string,
    ): CancelableRequest<T> {
      return request<T>({
        method: "POST",
        path,
        body: formData,
        isFormData: true,
        key,
      });
    },

    patchFormData<T>(
      path: string,
      formData: FormData,
      key?: string,
    ): CancelableRequest<T> {
      return request<T>({
        method: "PATCH",
        path,
        body: formData,
        isFormData: true,
        key,
      });
    },

    setAuthToken(token: string | null): void {
      authToken = token;
    },
  };
}
