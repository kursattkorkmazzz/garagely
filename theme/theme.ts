import { AppThemeTypes } from "@/shared/theme";
import { AppDarkColors, AppLightColors } from "@/theme/tokens/colors";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { withOpacity } from "@/theme/utils";

const CommonTheme = {
  radius: radius,
  spacing: spacing,
  utils: {
    withOpacity,
  },
};

export const AppTheme = {
  [AppThemeTypes.LIGHT]: {
    colors: AppLightColors,
    ...CommonTheme,
  },
  [AppThemeTypes.DARK]: {
    colors: AppDarkColors,
    ...CommonTheme,
  },
};

export type AppThemeType = typeof AppTheme;
