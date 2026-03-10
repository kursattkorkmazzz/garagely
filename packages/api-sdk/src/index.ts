import { createHttpClient } from "./client";
import { createAuthApi, type AuthApi } from "./modules/auth";
import { createUserApi, type UserApi } from "./modules/user";
import { createVehicleApi, type VehicleApi } from "./modules/vehicle";
import type { SdkConfig } from "./types";

export interface GaragelySdk {
  auth: AuthApi;
  user: UserApi;
  vehicle: VehicleApi;
  setAuthToken(token: string | null): void;
}

export function createSdk(config: SdkConfig): GaragelySdk {
  const client = createHttpClient(config);
  return {
    auth: createAuthApi(client),
    user: createUserApi(client),
    vehicle: createVehicleApi(client),
    setAuthToken: (token: string | null) => client.setAuthToken(token),
  };
}

export type {
  SdkConfig,
  SdkCallbacks,
  SdkError,
  CancelableRequest,
} from "./types";
export type { AuthApi, AuthResponse } from "./modules/auth";
export type { UserApi } from "./modules/user";
export type { VehicleApi } from "./modules/vehicle";
