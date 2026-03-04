import { createSdk, type GaragelySdk } from "@garagely/api-sdk";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.168.126.176:3000";

export const sdk: GaragelySdk = createSdk({
  baseUrl: API_BASE_URL,
});
