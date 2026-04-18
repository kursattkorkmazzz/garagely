export const AppThemeTypes = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type AppThemeType = (typeof AppThemeTypes)[keyof typeof AppThemeTypes];
