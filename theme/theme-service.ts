import { ThemeType, ThemeTypes } from "@/shared/theme";
import { colors, ThemeColors } from "@/theme/tokens/colors";
import { Appearance } from "react-native";

type ListenerType = () => void;

export type ThemeState = {
  theme: ThemeColors;
  selectedTheme: ThemeType;
  changeTheme: (theme: ThemeType) => Promise<void>;
  withOpacity: (color: keyof ThemeColors, opacityValue: number) => string;
};

export class ThemeService {
  private static listeners = new Set<ListenerType>();
  private static _theme: ThemeColors = colors.light;
  private static _selectedTheme: ThemeType = ThemeTypes.SYSTEM;
  private static _cachedState: ThemeState | null = null;

  // Arrow functions keep `this` stable — no `.bind()` needed at call site
  static subscribe = (listener: ListenerType) => {
    ThemeService.listeners.add(listener);
    return () => ThemeService.listeners.delete(listener);
  };

  static getState = (): ThemeState => {
    if (ThemeService._cachedState) return ThemeService._cachedState;

    ThemeService._cachedState = {
      theme: ThemeService._theme,
      selectedTheme: ThemeService._selectedTheme,
      changeTheme: ThemeService.changeTheme,
      withOpacity: ThemeService.withOpacity,
    };
    return ThemeService._cachedState;
  };

  static getTheme = (): ThemeColors => ThemeService._theme;
  static getSelectedTheme = (): ThemeType => ThemeService._selectedTheme;

  static changeTheme = async (theme: ThemeType) => {
    ThemeService._selectedTheme = theme;

    if (theme === ThemeTypes.SYSTEM) {
      const systemTheme = Appearance.getColorScheme();
      ThemeService._theme = systemTheme === "dark" ? colors.dark : colors.light;
    } else if (theme === ThemeTypes.DARK) {
      ThemeService._theme = colors.dark;
    } else {
      ThemeService._theme = colors.light;
    }

    ThemeService._notify();
  };

  static withOpacity = (
    color: keyof ThemeColors,
    opacityValue: number,
  ): string => {
    return ThemeService._hexToRgba(
      ThemeService._theme[color] as string,
      opacityValue,
    );
  };

  private static _notify() {
    ThemeService._cachedState = null; // invalidate snapshot
    ThemeService.listeners.forEach((listener) => listener());
  }

  private static _hexToRgba(hex: string, alpha: number = 1) {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const a = Math.max(0, Math.min(1, alpha));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}
