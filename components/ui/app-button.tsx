import { ThemeService } from "@/theme";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { typography } from "@/theme/tokens/typography";
import sva from "@/utils/sva/sva";
import { VariantProps } from "@/utils/sva/types";
import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import { AppText } from "./app-text";

const ButtonVariantStyles = sva({
  base: {
    root: {
      borderRadius: radius.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {},
  },
  variants: {
    variant: {
      primary: {
        root: { backgroundColor: ThemeService.getTheme().primary },
        text: { color: ThemeService.getTheme().primaryForeground },
      },
      secondary: {
        root: { backgroundColor: ThemeService.getTheme().secondary },
        text: { color: ThemeService.getTheme().secondaryForeground },
      },
      outline: {
        root: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: ThemeService.getTheme().border,
        },
        text: { color: ThemeService.getTheme().foreground },
      },
      ghost: {
        root: { backgroundColor: "transparent" },
        text: { color: ThemeService.getTheme().foreground },
      },
      destructive: {
        root: { backgroundColor: ThemeService.getTheme().destructive },
        text: { color: ThemeService.getTheme().destructiveForeground },
      },
      link: {
        root: { backgroundColor: "transparent" },
        text: {
          color: ThemeService.getTheme().primary,
          textDecorationLine: "underline",
        },
      },
    },
    size: {
      default: {
        root: {
          paddingVertical: spacing.sm + spacing.xs,
          paddingHorizontal: spacing.lg,
          minHeight: 48,
        },
        text: typography.buttonLarge,
      },
      sm: {
        root: {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          minHeight: 36,
        },
        text: typography.buttonMedium,
      },
      lg: {
        root: {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          minHeight: 56,
        },
        text: typography.buttonLarge,
      },
      icon: {
        root: {
          width: 44,
          height: 44,
          paddingVertical: 0,
          paddingHorizontal: 0,
        },
        text: {},
      },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

type AppButtonProps = Omit<PressableProps, "children"> &
  VariantProps<typeof ButtonVariantStyles> & {
    loading?: boolean;
    children: ReactNode;
  };

export function AppButton({
  variant = "primary",
  size = "default",
  loading = false,
  children,
  style,
  disabled,
  ...rest
}: AppButtonProps) {
  const isTextChild = typeof children === "string";
  const { root, text } = ButtonVariantStyles({ variant, size });

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={(state) => [
        root(),
        state.pressed && { opacity: 0.8 },
        disabled || loading ? { opacity: 0.5 } : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {isTextChild ? <AppText style={text()}>{children}</AppText> : children}
    </Pressable>
  );
}
