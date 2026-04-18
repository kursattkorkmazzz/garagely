import { BackgroundedIcon } from "@/components/list/backgrounded-icon";
import { AppText } from "@/components/ui/app-text";
import { IconName } from "@/components/ui/icon";
import { ChevronRight } from "lucide-react-native/icons";
import { ReactNode } from "react";
import { Pressable, PressableProps, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppListItemProps = PressableProps & {
  label: string;
  icon?: IconName;
  iconColor?: string;
  sub?: string;
  selectedValue?: string;
  trailing?: ReactNode; // toggle, segmented, badge, etc.
  chevron?: boolean;
  destructive?: boolean;
  first?: boolean; // grup içinde ilk satır
  last?: boolean; // grup içinde son satır
};

export function AppListItem({
  label,
  icon,
  iconColor,
  sub,
  selectedValue,
  trailing,
  chevron,
  destructive,
  first,
  last,
  ...props
}: AppListItemProps) {
  const { theme } = useUnistyles();
  const tintColor = iconColor ?? theme.colors.primary;

  return (
    <Pressable
      style={(state) => [
        styles.container,
        state.pressed && { backgroundColor: theme.colors.secondary },
      ]}
      {...props}
    >
      <View style={styles.leftContentContainer}>
        {icon ? (
          <BackgroundedIcon
            icon={icon}
            iconColor={destructive ? theme.colors.destructive : tintColor}
          />
        ) : null}
        <View style={styles.labelStack}>
          <AppText
            style={[
              styles.label,
              {
                color: destructive
                  ? theme.colors.destructive
                  : theme.colors.foreground,
              },
            ]}
          >
            {label}
          </AppText>
          {sub ? (
            <AppText
              style={[styles.sub, { color: theme.colors.mutedForeground }]}
            >
              {sub}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.rightContentContainer}>
        {selectedValue ? (
          <AppText
            style={[
              styles.selectedValue,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {selectedValue}
          </AppText>
        ) : null}
        {trailing}
        {chevron ? <ChevronRight color={theme.colors.muted} size={18} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm + 2, // 10
    paddingHorizontal: theme.spacing.md,
    minHeight: 52,
    width: "100%",
  },
  leftContentContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md - 2, // 14
  },
  labelStack: {
    flex: 1,
    minWidth: 0,
  },
  rightContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  label: {
    ...theme.typography.rowLabel,
  },
  sub: {
    ...theme.typography.rowSub,
    marginTop: 2,
  },
  selectedValue: {
    ...theme.typography.rowValue,
  },
}));
