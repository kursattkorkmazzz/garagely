import { AppText } from "@/components/ui/app-text";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function AppListSectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title.toUpperCase()}</AppText>
      {description && (
        <AppText style={styles.descirption}>{description}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md + theme.spacing.xs, // 20
    paddingTop: theme.spacing.md + 2,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.overline,
    color: theme.colors.mutedForeground,
  },
  descirption: {
    ...theme.typography.caption,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
}));
