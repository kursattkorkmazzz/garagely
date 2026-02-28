import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppBadge } from "@/components/ui/app-badge";
import { spacing } from "@/theme/tokens/spacing";

export default function BadgeShowcase() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* All Variants */}
      <View style={styles.section}>
        <AppText variant="heading5">Variants</AppText>
        <View style={styles.row}>
          <AppBadge>Default</AppBadge>
          <AppBadge variant="secondary">Secondary</AppBadge>
          <AppBadge variant="destructive">Destructive</AppBadge>
          <AppBadge variant="outline">Outline</AppBadge>
          <AppBadge variant="ghost">Ghost</AppBadge>
        </View>
      </View>

      {/* Use Cases */}
      <View style={styles.section}>
        <AppText variant="heading5">Use Cases</AppText>
        <View style={styles.column}>
          <View style={styles.row}>
            <AppBadge>New</AppBadge>
            <AppText>Feature announcement</AppText>
          </View>
          <View style={styles.row}>
            <AppBadge variant="secondary">Beta</AppBadge>
            <AppText>Beta version</AppText>
          </View>
          <View style={styles.row}>
            <AppBadge variant="destructive">Critical</AppBadge>
            <AppText>Critical issue</AppText>
          </View>
          <View style={styles.row}>
            <AppBadge variant="outline">v1.0.0</AppBadge>
            <AppText>Version tag</AppText>
          </View>
          <View style={styles.row}>
            <AppBadge variant="ghost">Archived</AppBadge>
            <AppText>Archived item</AppText>
          </View>
        </View>
      </View>

      {/* Status Examples */}
      <View style={styles.section}>
        <AppText variant="heading5">Status Examples</AppText>
        <View style={styles.row}>
          <AppBadge>Active</AppBadge>
          <AppBadge variant="secondary">Pending</AppBadge>
          <AppBadge variant="destructive">Error</AppBadge>
          <AppBadge variant="ghost">Inactive</AppBadge>
        </View>
      </View>

      {/* Notification Count */}
      <View style={styles.section}>
        <AppText variant="heading5">Notification Count</AppText>
        <View style={styles.row}>
          <AppBadge>3</AppBadge>
          <AppBadge variant="destructive">99+</AppBadge>
          <AppBadge variant="secondary">12</AppBadge>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  column: {
    gap: spacing.sm,
  },
});
