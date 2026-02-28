import { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  PressableProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "./app-text";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

type AppButtonProps = Omit<PressableProps, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function AppButton({
  variant = "primary",
  size = "default",
  children,
  style,
  disabled,
  ...rest
}: AppButtonProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "primary":
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
      case "destructive":
        return {
          container: {
            backgroundColor: theme.destructive,
          },
          text: {
            color: theme.destructiveForeground,
          },
        };
      case "link":
        return {
          container: {
            backgroundColor: "transparent",
          },
          text: {
            color: theme.primary,
            textDecorationLine: "none",
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          container: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            minHeight: 36,
          },
          text: {
            fontSize: 14,
          },
        };
      case "lg":
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            minHeight: 56,
          },
          text: {
            fontSize: 18,
          },
        };
      case "icon":
        return {
          container: {
            width: 44,
            height: 44,
            paddingVertical: 0,
            paddingHorizontal: 0,
          },
          text: {},
        };
      default:
        return {
          container: {
            paddingVertical: spacing.sm + spacing.xs,
            paddingHorizontal: spacing.lg,
            minHeight: 48,
          },
          text: {
            fontSize: 16,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    container: {
      borderRadius: radius * 2,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
      ...variantStyles.container,
      ...sizeStyles.container,
    },
  });

  const textStyle: TextStyle = {
    fontWeight: "600",
    ...variantStyles.text,
    ...sizeStyles.text,
  };

  const isTextChild = typeof children === "string";

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={(state) => [
        styles.container,
        state.pressed && { opacity: 0.8 },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {isTextChild ? (
        <AppText variant="buttonMedium" style={textStyle}>
          {children}
        </AppText>
      ) : (
        children
      )}
    </Pressable>
  );
}
