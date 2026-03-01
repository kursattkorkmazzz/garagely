import type { RegisterPayload, LoginPayload } from "@garagely/shared/payloads/auth";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { HttpClient, SdkCallbacks, SdkError } from "../../types";

export interface AuthResponse {
  user: UserWithPreferences;
  customToken: string;
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
  };
}
