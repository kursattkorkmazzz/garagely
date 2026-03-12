import * as SecureStore from "expo-secure-store";

const PREFERENCES_CACHE_KEY = "garagely_preferences_cache";

export interface CachedPreferences {
  theme?: string;
  locale?: string;
  preferredDistanceUnit?: string;
  preferredVolumeUnit?: string;
  preferredCurrency?: string;
}

export async function getCachedPreferences(): Promise<CachedPreferences | null> {
  try {
    const cached = await SecureStore.getItemAsync(PREFERENCES_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export async function setCachedPreferences(
  preferences: CachedPreferences,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      PREFERENCES_CACHE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // Ignore storage errors
  }
}

export async function clearCachedPreferences(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PREFERENCES_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}
