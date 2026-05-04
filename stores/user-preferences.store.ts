import { UserPreferencesService } from "@/features/user-preferences/user-preferences.service";
import { LocalizationService } from "@/i18n/localization.service";
import { CurrencyTypes, type CurrencyType } from "@/shared/currency";
import { DistanceTypes, type DistanceType } from "@/shared/distance";
import { Languages, type Language } from "@/shared/languages";
import { AppThemeTypes, type AppThemeType } from "@/shared/theme";
import { type TimezoneString } from "@/shared/timezone";
import { VolumeTypes, type VolumeType } from "@/shared/volume";
import { UnistylesRuntime } from "react-native-unistyles";
import { create } from "zustand";

interface UserPreferencesState {
  theme: AppThemeType;
  language: Language;
  distanceUnit: DistanceType;
  currency: CurrencyType;
  volumeUnit: VolumeType;
  timezone: TimezoneString;
  isLoaded: boolean;
}

interface UserPreferencesActions {
  load: () => Promise<void>;
  setTheme: (v: AppThemeType) => Promise<void>;
  setLanguage: (v: Language) => Promise<void>;
  setDistanceUnit: (v: DistanceType) => Promise<void>;
  setCurrency: (v: CurrencyType) => Promise<void>;
  setVolumeUnit: (v: VolumeType) => Promise<void>;
  setTimezone: (v: TimezoneString) => Promise<void>;
}

export const useUserPreferencesStore = create<
  UserPreferencesState & UserPreferencesActions
>()((set) => ({
  theme: AppThemeTypes.SYSTEM,
  language: Languages.EN,
  distanceUnit: DistanceTypes.KM,
  currency: CurrencyTypes.TRY,
  volumeUnit: VolumeTypes.L,
  timezone: "UTC",
  isLoaded: false,

  load: async () => {
    const prefs = await UserPreferencesService.getOrCreate();
    const resolvedTheme =
      prefs.theme === AppThemeTypes.SYSTEM ? AppThemeTypes.LIGHT : prefs.theme;
    UnistylesRuntime.setTheme(resolvedTheme);
    LocalizationService.changeLanguage(prefs.language);
    set({
      theme: prefs.theme,
      language: prefs.language,
      distanceUnit: prefs.distanceUnit,
      currency: prefs.currency,
      volumeUnit: prefs.volumeUnit,
      timezone: prefs.timezone,
      isLoaded: true,
    });
  },

  setTheme: async (theme) => {
    set({ theme });
    const resolved =
      theme === AppThemeTypes.SYSTEM ? AppThemeTypes.LIGHT : theme;
    UnistylesRuntime.setTheme(resolved);
    await UserPreferencesService.update({ theme });
  },

  setLanguage: async (language) => {
    set({ language });
    LocalizationService.changeLanguage(language);
    await UserPreferencesService.update({ language });
  },

  setDistanceUnit: async (distanceUnit) => {
    set({ distanceUnit });
    await UserPreferencesService.update({ distanceUnit });
  },

  setCurrency: async (currency) => {
    set({ currency });
    await UserPreferencesService.update({ currency });
  },

  setVolumeUnit: async (volumeUnit) => {
    set({ volumeUnit });
    await UserPreferencesService.update({ volumeUnit });
  },

  setTimezone: async (timezone) => {
    set({ timezone });
    await UserPreferencesService.update({ timezone });
  },
}));
