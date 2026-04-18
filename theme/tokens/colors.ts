// theme/tokens/colors.ts
// Variant 1 (Modern Minimal) — Rose primary, dark-first, warm neutrals

export const AppLightColors = {
  // Primary — Rose 500
  primary: "#F43F5E",
  primaryForeground: "#ffffff",

  // Secondary — subtle neutral surface
  secondary: "#F5F5F4",
  secondaryForeground: "#14110F",

  accent: "#F43F5E",
  accentForeground: "#ffffff",

  // Surfaces
  background: "#FAFAF9",
  foreground: "#14110F",

  card: "#FFFFFF",
  cardForeground: "#14110F",

  popover: "#FFFFFF",
  popoverForeground: "#14110F",

  muted: "#A8A29E",
  mutedForeground: "#57534E",

  destructive: "#E11D48",
  destructiveForeground: "#ffffff",

  border: "#E7E5E4",
  input: "#E7E5E4",
  ring: "#F43F5E",

  bottomBar: {
    background: "#FFFFFF",
    foreground: "#14110F",

    primary: "#F43F5E",
    primaryForeground: "#ffffff",

    accent: "#F5F5F4",
    accentForeground: "#14110F",

    border: "#E7E5E4",

    ring: "#F43F5E",
  },

  // Semantic icon background pool (Variant 1 — tüm ikonlar rose; bu alan
  // istisnai durumlar için korunuyor)
  color: {
    red: "#EF4444",
    redForeground: "#ffffff",
    orange: "#F59E0B",
    orangeForeground: "#ffffff",
    cyan: "#06B6D4",
    cyanForeground: "#ffffff",
    green: "#10B981",
    greenForeground: "#ffffff",
    purple: "#8B5CF6",
    purpleForeground: "#ffffff",
    rose: "#F43F5E",
    roseForeground: "#ffffff",
  },
};

export type ThemeColors = typeof AppLightColors;

export const AppDarkColors = {
  primary: "#F43F5E",
  primaryForeground: "#ffffff",

  secondary: "#1C1A19",
  secondaryForeground: "#FAFAF9",

  accent: "#F43F5E",
  accentForeground: "#ffffff",

  // Dark-first warm neutrals
  background: "#0B0908",
  foreground: "#FAFAF9",

  card: "#14110F",
  cardForeground: "#FAFAF9",

  popover: "#1C1A19",
  popoverForeground: "#FAFAF9",

  muted: "#78716C",
  mutedForeground: "#A8A29E",

  destructive: "#FB7185",
  destructiveForeground: "#ffffff",

  border: "#292524",
  input: "#292524",
  ring: "#F43F5E",

  bottomBar: {
    background: "#14110F",
    foreground: "#FAFAF9",

    primary: "#F43F5E",
    primaryForeground: "#ffffff",

    accent: "#1C1A19",
    accentForeground: "#FAFAF9",

    border: "#292524",

    ring: "#F43F5E",
  },

  color: {
    red: "#F87171",
    redForeground: "#ffffff",
    orange: "#FBBF24",
    orangeForeground: "#ffffff",
    cyan: "#22D3EE",
    cyanForeground: "#ffffff",
    green: "#34D399",
    greenForeground: "#ffffff",
    purple: "#A78BFA",
    purpleForeground: "#ffffff",
    rose: "#FB7185",
    roseForeground: "#ffffff",
  },
};
