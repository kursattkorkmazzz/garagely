import { typography } from "@/theme/tokens/typography";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";
import {
  StyleSheet,
  UnistylesVariants,
  useUnistyles,
} from "react-native-unistyles";

// 1. Stylesheet önce tanımlanır
const stylesheet = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
        },
        outline: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        ghost: {
          backgroundColor: "transparent",
        },
        link: {
          backgroundColor: "transparent",
        },
        icon: {
          backgroundColor: "transparent",
        },
      },
      size: {
        sm: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radius.md,
          minHeight: 36,
        },
        md: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.md,
          minHeight: 44,
        },
        lg: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          minHeight: 56,
        },
        icon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
        },
      },
    },
  },

  label: {
    variants: {
      variant: {
        primary: { color: theme.colors.primaryForeground },
        secondary: { color: theme.colors.secondaryForeground },
        outline: { color: theme.colors.foreground },
        ghost: { color: theme.colors.foreground },
        link: {
          color: theme.colors.primary,
          textDecorationLine: "underline",
        },
        icon: {},
      },
      size: {
        sm: typography.buttonSmall,
        md: typography.buttonMedium,
        lg: typography.buttonLarge,
        icon: {},
      },
    },
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },
}));

// 2. Tipler stylesheet'ten infer edilir — manuel tanım yok
export type AppButtonProps = Omit<PressableProps, "children"> &
  UnistylesVariants<typeof stylesheet> & {
    loading?: boolean;
    children?: ReactNode;
  };

// 3. Bileşen
export function AppButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: AppButtonProps) {
  stylesheet.useVariants({ variant, size });

  const { theme } = useUnistyles();
  const isTextChild = typeof children === "string";

  const indicatorColor =
    variant === "outline" || variant === "ghost" || variant === "link"
      ? theme.colors.foreground
      : theme.colors.primaryForeground;

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={(state) => [
        stylesheet.container,
        state.pressed && stylesheet.pressed,
        (disabled || loading) && stylesheet.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : isTextChild ? (
        <Text style={stylesheet.label}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
