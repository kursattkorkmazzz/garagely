import { useTheme } from "@/theme/theme-context";
import { useThemedStylesheet } from "@/theme/hooks/use-themed-stylesheet";
import { TypographyType, typography } from "@/theme/tokens/typography";
import { ThemeType } from "@/theme/tokens/colors";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

type ColorVariant =
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "muted"
  | "red"
  | "orange"
  | "cyan"
  | "green"
  | "purple";

type AppTextProps = TextProps & {
  variant?: TypographyType;
  color?: ColorVariant;
};

function getColorFromVariant(theme: ThemeType, color: ColorVariant): string {
  switch (color) {
    case "primary":
      return theme.primary;
    case "secondary":
      return theme.secondaryForeground;
    case "accent":
      return theme.accent;
    case "destructive":
      return theme.destructive;
    case "muted":
      return theme.mutedForeground;
    case "red":
      return theme.color.red;
    case "orange":
      return theme.color.orange;
    case "cyan":
      return theme.color.cyan;
    case "green":
      return theme.color.green;
    case "purple":
      return theme.color.purple;
    default:
      return theme.foreground;
  }
}

export function AppText({
  variant = "bodyLarge",
  color = "default",
  style,
  ...rest
}: AppTextProps) {
  const { theme } = useTheme();

  const defaultStyles = useThemedStylesheet(() =>
    StyleSheet.create({
      base: {
        color: getColorFromVariant(theme, color),
        fontSize: typography[variant].fontSize,
        fontWeight: typography[variant].fontWeight as TextStyle["fontWeight"],
        fontStyle: typography[variant].italic ? "italic" : "normal",
        textDecorationLine: typography[variant].underline
          ? "underline"
          : "none",
      },
      heading1: {},
      heading2: {},
      heading3: {},
      heading4: {},
      heading5: {},
      heading6: {},
      bodyLarge: {},
      bodyMedium: {},
      bodySmall: {},
      label: {},
      helperText: {},
      caption: {},
      overline: {},
      buttonLarge: {},
      buttonMedium: {},
      buttonSmall: {},
      quote: {},
      code: {},
      kbd: {},
      mark: {},
    }),
  );

  return (
    <Text
      {...rest}
      style={[defaultStyles.base, defaultStyles[variant], style]}
    />
  );
}
