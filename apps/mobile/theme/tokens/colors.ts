export const colors = {
  light: {
    primary: "#fb2c36",
    primaryForeground: "#fafafa",

    secondary: "#f7f7f7",
    secondaryForeground: "#262626",

    accent: "#fb2c36",
    accentForeground: "#fafafa",

    background: "#fafafa",
    foreground: "#0a0a0a",

    card: "#ffffff",
    cardForeground: "#0a0a0a",

    popover: "#ffffff",
    popoverForeground: "#0a0a0a",

    muted: "#d2d1e9",
    mutedForeground: "#8b84c4",

    destructive: "#e64d5a",
    destructiveForeground: "#ffffff",

    border: "#ededff",
    input: "#ededff",
    ring: "#fb2c36",

    bottomBar: {
      backgrund: "#f7f7f7",
      foreground: "#0a0a0a",

      primary: "#fb2c36",
      primaryForeground: "#fafafa",

      accent: "#ededff",
      accentForeground: "#0a0a0a",

      border: "#ededff",

      ring: "#fb2c36",
    },

    color: {
      red: "#ff7b74",
      orange: "#ff9711",
      cyan: "#00b7c0",
      green: "#4cb332",
      purple: "#9499fa",
    },
  },
  dark: {
    primary: "#fb2c36",
    primaryForeground: "#fafafa",

    secondary: "#262626",
    secondaryForeground: "#fafafa",

    accent: "#fb2c36",
    accentForeground: "#fafafa",

    background: "#0a0a0a",
    foreground: "#fafafa",

    card: "#18181b",
    cardForeground: "#fafafa",

    popover: "#262626",
    popoverForeground: "#fafafa",

    muted: "#27272a",
    mutedForeground: "#e7e5e4",

    destructive: "#ff6467",
    destructiveForeground: "#fafafa",

    border: "#404040",
    input: "#404040",
    ring: "#fb2c36",

    bottomBar: {
      backgrund: "#171717",
      foreground: "#fafafa",

      primary: "#ff6467",
      primaryForeground: "#fafafa",

      accent: "#262626",
      accentForeground: "#fafafa",

      border: "#404040",

      ring: "#ff6467",
    },

    color: {
      red: "#ff7b74",
      orange: "#ff9711",
      cyan: "#00b7c0",
      green: "#4cb332",
      purple: "#9499fa",
    },
  },
};

export type ThemeType = typeof colors.light;
export type Theme = keyof typeof colors;
