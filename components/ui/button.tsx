import { radius, spacing, typography } from "@/theme";
import { useTheme } from "@/theme/hooks/use-theme";
import { useMemo } from "react";
import {
  Pressable,
  type PressableProps,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "default",
  size = "md",
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { theme, withOpacity } = useTheme();

  const { containerStyle, textStyle, pressedBg } = useMemo(() => {
    // --- Variant styles ---
    const variantContainer: Record<ButtonVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.primary,
      },
      destructive: {
        backgroundColor: theme.destructive,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.border,
      },
      secondary: {
        backgroundColor: theme.secondary,
      },
      ghost: {
        backgroundColor: "transparent",
      },
      link: {
        backgroundColor: "transparent",
      },
    };

    const variantText: Record<ButtonVariant, TextStyle> = {
      default: { color: theme.primaryForeground },
      destructive: { color: theme.destructiveForeground },
      outline: { color: theme.foreground },
      secondary: { color: theme.secondaryForeground },
      ghost: { color: theme.foreground },
      link: { color: theme.primary, textDecorationLine: "underline" },
    };

    // Pressed state background (slightly dimmed)
    const pressedBgMap: Record<ButtonVariant, string> = {
      default: withOpacity("primary", 0.8),
      destructive: withOpacity("destructive", 0.8),
      outline: withOpacity("border", 0.3),
      secondary: withOpacity("secondary", 0.7),
      ghost: withOpacity("foreground", 0.08),
      link: "transparent",
    };

    // --- Size styles ---
    const sizeContainer: Record<ButtonSize, ViewStyle> = {
      sm: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.md,
      },
      md: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
      },
      lg: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
      },
      icon: {
        padding: spacing.sm,
        borderRadius: radius.md,
      },
    };

    const sizeText: Record<ButtonSize, TextStyle> = {
      sm: typography.buttonSmall,
      md: typography.buttonMedium,
      lg: typography.buttonLarge,
      icon: {},
    };

    const containerStyle: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: spacing.xs,
      ...variantContainer[variant],
      ...sizeContainer[size],
    };

    const textStyle: TextStyle = {
      ...variantText[variant],
      ...sizeText[size],
    };

    return { containerStyle, textStyle, pressedBg: pressedBgMap[variant] };
  }, [theme, withOpacity, variant, size]);

  return (
    <Pressable
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        containerStyle,
        pressed && { backgroundColor: pressedBg },
        disabled && { opacity: 0.5 },
        typeof style === "function"
          ? style({ pressed, hovered: false })
          : style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
