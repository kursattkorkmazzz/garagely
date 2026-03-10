import type {
  RegisterPayload,
  LoginPayload,
  ChangePasswordPayload,
} from "@garagely/shared/payloads/auth";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { ApiResponse } from "@garagely/shared/response.types";
import type {
  HttpClient,
  SdkCallbacks,
  SdkError,
  CancelableRequest,
} from "../../types";

export interface AuthResponseData {
  user: UserWithPreferences;
  customToken: string;
}

export interface ChangePasswordResponseData {
  message: string;
}

export type AuthResponse = ApiResponse<AuthResponseData>;
export type ChangePasswordResponse = ApiResponse<ChangePasswordResponseData>;

export interface AuthApi {
  register(
    payload: RegisterPayload,
    callbacks?: SdkCallbacks<AuthResponse>,
    key?: string,
  ): CancelableRequest<void>;
  login(
    payload: LoginPayload,
    callbacks?: SdkCallbacks<AuthResponse>,
    key?: string,
  ): CancelableRequest<void>;
  changePassword(
    payload: ChangePasswordPayload,
    callbacks?: SdkCallbacks<ChangePasswordResponse>,
    key?: string,
  ): CancelableRequest<void>;
}

export function createAuthApi(client: HttpClient): AuthApi {
  return {
    register(
      payload: RegisterPayload,
      callbacks?: SdkCallbacks<AuthResponse>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.post<AuthResponse>(
        "/auth/register",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    login(
      payload: LoginPayload,
      callbacks?: SdkCallbacks<AuthResponse>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.post<AuthResponse>(
        "/auth/login",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    changePassword(
      payload: ChangePasswordPayload,
      callbacks?: SdkCallbacks<ChangePasswordResponse>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.post<ChangePasswordResponse>(
        "/auth/change-password",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },
  };
}
