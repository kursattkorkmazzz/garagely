import { AppText } from "@/components/ui/app-text";
import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Tone = "primary" | "neutral" | "success" | "warning" | "danger";

type AppBadgeProps = {
  children: ReactNode;
  tone?: Tone;
  solid?: boolean;
};

export function AppBadge({
  children,
  tone = "neutral",
  solid = false,
}: AppBadgeProps) {
  const { theme } = useUnistyles();

  const palette = {
    primary: {
      fg: theme.colors.primary,
      solidFg: theme.colors.primaryForeground,
      bg: theme.colors.primary,
    },
    neutral: {
      fg: theme.colors.mutedForeground,
      solidFg: theme.colors.foreground,
      bg: theme.colors.muted,
    },
    success: {
      fg: theme.colors.color.green,
      solidFg: theme.colors.color.greenForeground,
      bg: theme.colors.color.green,
    },
    warning: {
      fg: theme.colors.color.orange,
      solidFg: theme.colors.color.orangeForeground,
      bg: theme.colors.color.orange,
    },
    danger: {
      fg: theme.colors.destructive,
      solidFg: theme.colors.destructiveForeground,
      bg: theme.colors.destructive,
    },
  }[tone];

  const bg = solid ? palette.bg : theme.utils.withOpacity(palette.bg, 0.14);
  const fg = solid ? palette.solidFg : palette.fg;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AppText style={[styles.label, { color: fg }]}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    alignSelf: "flex-start",
  },
  label: {
    ...theme.typography.overline,
    fontSize: 10,
  },
}));
