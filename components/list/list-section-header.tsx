import { AppText } from "@/components/ui/app-text";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function AppListSectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.mutedForeground,
    fontWeight: "bold",
  },
}));
