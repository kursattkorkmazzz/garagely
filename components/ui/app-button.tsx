import { ThemeService } from "@/theme";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import sva from "@/utils/sva/sva";
import { VariantProps } from "@/utils/sva/types";
import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import { AppText } from "./app-text";

const ButtonVariantStyles = sva({
  base: {
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: ThemeService.getTheme().primary,
        color: ThemeService.getTheme().primaryForeground,
      },
      secondary: {
        backgroundColor: ThemeService.getTheme().secondary,
        color: ThemeService.getTheme().secondaryForeground,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: ThemeService.getTheme().border,
      },
      ghost: {
        backgroundColor: "transparent",
        color: ThemeService.getTheme().foreground,
      },
      destructive: {
        backgroundColor: ThemeService.getTheme().destructive,
        color: ThemeService.getTheme().destructiveForeground,
      },
      link: {
        backgroundColor: "transparent",
        color: ThemeService.getTheme().primary,
        textDecorationLine: "underline",
      },
    },
    size: {
      default: {
        paddingVertical: spacing.sm + spacing.xs,
        paddingHorizontal: spacing.lg,
        minHeight: 48,
        fontSize: 16,
      },
      sm: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minHeight: 36,
        fontSize: 14,
      },
      lg: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        minHeight: 56,
        fontSize: 18,
      },
      icon: {
        width: 44,
        height: 44,
        paddingVertical: 0,
        paddingHorizontal: 0,
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

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={(state) => [
        ButtonVariantStyles({ variant, size }),
        state.pressed && { opacity: 0.8 },
        typeof style === "function" ? style(state) : style,
        { opacity: disabled || loading ? 0.5 : 1 },
      ]}
    >
      {isTextChild ? (
        <AppText
          style={[
            ButtonVariantStyles({ variant }),
            { padding: 1, minHeight: 0 },
          ]}
        >
          {children}
        </AppText>
      ) : (
        children
      )}
    </Pressable>
  );
}
