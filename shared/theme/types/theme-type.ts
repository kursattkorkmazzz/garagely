export const ThemeTypes = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeType = (typeof ThemeTypes)[keyof typeof ThemeTypes];
