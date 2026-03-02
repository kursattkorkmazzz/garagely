import { ReactNode } from "react";
import { View, StyleSheet, Pressable, PressableProps } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "@/components/ui/app-text";
import { AppIcon, IconName } from "@/components/ui/app-icon";
import { AppSwitch } from "@/components/ui/app-switch";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

// Section Component
type AppSettingsSectionProps = {
  title?: string;
  children: ReactNode;
};

export function AppSettingsSection({
  title,
  children,
}: AppSettingsSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      {title && (
        <AppText
          variant="caption"
          style={[styles.sectionTitle, { color: theme.mutedForeground }]}
        >
          {title}
        </AppText>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

// Item Component
type AppSettingsItemProps = Omit<PressableProps, "children"> & {
  icon: IconName;
  iconColor?: string;
  iconBackgroundColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  accessory?: "chevron" | "switch" | "none";
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

export function AppSettingsItem({
  icon,
  iconColor,
  iconBackgroundColor,
  title,
  subtitle,
  value,
  accessory = "chevron",
  switchValue,
  onSwitchChange,
  onPress,
  disabled,
  ...rest
}: AppSettingsItemProps) {
  const { theme, withOpacity } = useTheme();

  const isClickable = accessory === "chevron" && onPress;

  return (
    <Pressable
      {...rest}
      onPress={isClickable ? onPress : undefined}
      disabled={disabled || !isClickable}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        pressed &&
          isClickable && { backgroundColor: withOpacity(theme.muted, 0.1) },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              iconBackgroundColor ?? withOpacity(theme.primary, 0.15),
          },
        ]}
      >
        <AppIcon icon={icon} size={18} color={iconColor ?? theme.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <AppText variant="bodyMedium">{title}</AppText>
          {subtitle && (
            <AppText variant="caption" color="muted">
              {subtitle}
            </AppText>
          )}
        </View>

        <View style={styles.rightContainer}>
          {value && (
            <AppText variant="bodySmall" color="muted" style={styles.value}>
              {value}
            </AppText>
          )}

          {accessory === "chevron" && (
            <AppIcon icon="ChevronRight" size={20} color={theme.muted} />
          )}

          {accessory === "switch" && (
            <AppSwitch value={switchValue} onChange={onSwitchChange} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.md,
    minHeight: 56,
    borderRadius: radius * 1.5,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    marginLeft: spacing.md,
    minHeight: 56,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  value: {
    marginRight: spacing.xs,
  },
});
