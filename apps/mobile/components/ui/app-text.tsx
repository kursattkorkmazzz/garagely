import { useThemedStylesheet } from "@/theme/hooks/use-themed-stylesheet";
import { TypographyType, typography } from "@/theme/tokens/typography";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

type AppTextProps = TextProps & {
  variant?: TypographyType;
};

export function AppText({
  variant = "bodyLarge",
  style,
  ...rest
}: AppTextProps) {
  const defaultStyles = useThemedStylesheet((theme) =>
    StyleSheet.create({
      base: {
        color: theme.foreground,
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
