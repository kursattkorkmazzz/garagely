import { createHttpClient } from "./client";
import { createAuthApi, type AuthApi } from "./modules/auth";
import { createUserApi, type UserApi } from "./modules/user";
import type { SdkConfig } from "./types";

export interface GaragelySdk {
  auth: AuthApi;
  user: UserApi;
  setAuthToken(token: string | null): void;
}

export function createSdk(config: SdkConfig): GaragelySdk {
  const client = createHttpClient(config);

  return {
    auth: createAuthApi(client),
    user: createUserApi(client),
    setAuthToken: (token: string | null) => client.setAuthToken(token),
  };
}

export type { SdkConfig, SdkCallbacks, SdkError } from "./types";
export type { AuthApi, AuthResponse } from "./modules/auth";
export type { UserApi } from "./modules/user";
