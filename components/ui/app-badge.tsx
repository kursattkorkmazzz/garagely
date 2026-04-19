import { AppText } from "@/components/ui/app-text";
import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

export type AppBadgeProps = UnistylesVariants<typeof stylesheet> & {
  children: ReactNode;
};

export function AppBadge({ children, tone = "neutral", fill = "ghost" }: AppBadgeProps) {
  stylesheet.useVariants({ tone, fill });

  return (
    <View style={stylesheet.container}>
      <AppText style={stylesheet.label}>{children}</AppText>
    </View>
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    alignSelf: "flex-start" as const,
    variants: {
      tone: {
        primary: {},
        neutral: {},
        success: {},
        warning: {},
        danger: {},
      },
      fill: {
        ghost: {},
        solid: {},
      },
    },
    compoundVariants: [
      { tone: "primary", fill: "ghost", styles: { backgroundColor: theme.utils.withOpacity(theme.colors.primary, 0.14) } },
      { tone: "neutral", fill: "ghost", styles: { backgroundColor: theme.utils.withOpacity(theme.colors.muted, 0.14) } },
      { tone: "success", fill: "ghost", styles: { backgroundColor: theme.utils.withOpacity(theme.colors.color.green, 0.14) } },
      { tone: "warning", fill: "ghost", styles: { backgroundColor: theme.utils.withOpacity(theme.colors.color.orange, 0.14) } },
      { tone: "danger",  fill: "ghost", styles: { backgroundColor: theme.utils.withOpacity(theme.colors.destructive, 0.14) } },
      { tone: "primary", fill: "solid", styles: { backgroundColor: theme.colors.primary } },
      { tone: "neutral", fill: "solid", styles: { backgroundColor: theme.colors.muted } },
      { tone: "success", fill: "solid", styles: { backgroundColor: theme.colors.color.green } },
      { tone: "warning", fill: "solid", styles: { backgroundColor: theme.colors.color.orange } },
      { tone: "danger",  fill: "solid", styles: { backgroundColor: theme.colors.destructive } },
    ],
  },

  label: {
    ...theme.typography.overline,
    fontSize: 10,
    variants: {
      tone: {
        primary: {},
        neutral: {},
        success: {},
        warning: {},
        danger: {},
      },
      fill: {
        ghost: {},
        solid: {},
      },
    },
    compoundVariants: [
      { tone: "primary", fill: "ghost", styles: { color: theme.colors.primary } },
      { tone: "neutral", fill: "ghost", styles: { color: theme.colors.mutedForeground } },
      { tone: "success", fill: "ghost", styles: { color: theme.colors.color.green } },
      { tone: "warning", fill: "ghost", styles: { color: theme.colors.color.orange } },
      { tone: "danger",  fill: "ghost", styles: { color: theme.colors.destructive } },
      { tone: "primary", fill: "solid", styles: { color: theme.colors.primaryForeground } },
      { tone: "neutral", fill: "solid", styles: { color: theme.colors.foreground } },
      { tone: "success", fill: "solid", styles: { color: theme.colors.color.greenForeground } },
      { tone: "warning", fill: "solid", styles: { color: theme.colors.color.orangeForeground } },
      { tone: "danger",  fill: "solid", styles: { color: theme.colors.destructiveForeground } },
    ],
  },
}));
