import { BackgroundedIcon } from "@/components/list/backgrounded-icon";
import { AppText } from "@/components/ui/app-text";
import { IconName } from "@/components/ui/icon";
import { ChevronRight } from "lucide-react-native/icons";
import { Pressable, PressableProps, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppListItemProps = PressableProps & {
  label: string;
  icon: IconName;
  iconColor: string;
  selectedValue?: string;
};

export function AppListItem({
  label,
  icon,
  iconColor,
  selectedValue,
  ...props
}: AppListItemProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable style={styles.container} {...props}>
      <View style={styles.leftContentContainer}>
        <BackgroundedIcon icon={icon} iconColor={iconColor} />
        <AppText style={styles.label}>{label}</AppText>
      </View>
      <View style={styles.rightContentContainer}>
        {selectedValue && (
          <AppText style={styles.selectedValue}>{selectedValue}</AppText>
        )}
        <ChevronRight color={theme.colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    width: "100%",
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
  },
  leftContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  rightContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.mutedForeground,
  },
  selectedValue: {
    color: theme.colors.mutedForeground,
  },
}));
