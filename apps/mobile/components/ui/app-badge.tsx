import { ReactNode } from "react";
import { View, StyleSheet, ViewProps, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "./app-text";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost";

type AppBadgeProps = ViewProps & {
  variant?: BadgeVariant;
  children: ReactNode;
};

export function AppBadge({
  variant = "default",
  children,
  style,
  ...rest
}: AppBadgeProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "default":
        return {
          container: {
            backgroundColor: theme.primary,
          },
          text: {
            color: theme.primaryForeground,
          },
        };
      case "secondary":
        return {
          container: {
            backgroundColor: theme.secondary,
          },
          text: {
            color: theme.secondaryForeground,
          },
        };
      case "destructive":
        return {
          container: {
            backgroundColor: theme.destructive,
          },
          text: {
            color: theme.destructiveForeground,
          },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.border,
          },
          text: {
            color: theme.foreground,
          },
        };
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
          },
          text: {
            color: theme.foreground,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();

  const styles = StyleSheet.create({
    container: {
      alignSelf: "flex-start",
      borderRadius: radius * 1.5,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm + spacing.xs,
      ...variantStyles.container,
    },
  });

  const textStyle: TextStyle = {
    fontSize: 12,
    fontWeight: "600",
    ...variantStyles.text,
  };

  return (
    <View {...rest} style={[styles.container, style]}>
      <AppText variant="caption" style={textStyle}>
        {children}
      </AppText>
    </View>
  );
}
