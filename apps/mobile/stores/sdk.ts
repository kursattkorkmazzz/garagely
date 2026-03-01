import { createSdk, type GaragelySdk } from "@garagely/api-sdk";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.103:3000";

export const sdk: GaragelySdk = createSdk({
  baseUrl: API_BASE_URL,
});
