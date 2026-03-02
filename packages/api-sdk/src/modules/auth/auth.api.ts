import type { RegisterPayload, LoginPayload, ChangePasswordPayload } from "@garagely/shared/payloads/auth";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { HttpClient, SdkCallbacks, SdkError } from "../../types";

export interface AuthResponse {
  user: UserWithPreferences;
  customToken: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface AuthApi {
  register(
    payload: RegisterPayload,
    callbacks?: SdkCallbacks<AuthResponse>,
  ): Promise<void>;
  login(
    payload: LoginPayload,
    callbacks?: SdkCallbacks<AuthResponse>,
  ): Promise<void>;
  changePassword(
    payload: ChangePasswordPayload,
    callbacks?: SdkCallbacks<ChangePasswordResponse>,
  ): Promise<void>;
}

export function createAuthApi(client: HttpClient): AuthApi {
  return {
    async register(
      payload: RegisterPayload,
      callbacks?: SdkCallbacks<AuthResponse>,
    ): Promise<void> {
      try {
        const data = await client.post<AuthResponse>("/auth/register", payload);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async login(
      payload: LoginPayload,
      callbacks?: SdkCallbacks<AuthResponse>,
    ): Promise<void> {
      try {
        const data = await client.post<AuthResponse>("/auth/login", payload);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async changePassword(
      payload: ChangePasswordPayload,
      callbacks?: SdkCallbacks<ChangePasswordResponse>,
    ): Promise<void> {
      try {
        const data = await client.post<ChangePasswordResponse>("/auth/change-password", payload);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },
  };
}
