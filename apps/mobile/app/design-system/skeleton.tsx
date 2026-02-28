import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppSkeleton } from "@/components/ui/app-skeleton";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

export default function SkeletonShowcase() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Basic Skeleton */}
      <View style={styles.section}>
        <AppText variant="heading5">Basic Skeleton</AppText>
        <AppSkeleton style={{ width: 200, height: 20 }} />
      </View>

      {/* Different Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Different Sizes</AppText>
        <View style={styles.column}>
          <AppSkeleton style={{ width: "100%", height: 16 }} />
          <AppSkeleton style={{ width: "80%", height: 16 }} />
          <AppSkeleton style={{ width: "60%", height: 16 }} />
        </View>
      </View>

      {/* Circle (Avatar Placeholder) */}
      <View style={styles.section}>
        <AppText variant="heading5">Circle (Avatar)</AppText>
        <View style={styles.row}>
          <AppSkeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
          <AppSkeleton style={{ width: 56, height: 56, borderRadius: 28 }} />
          <AppSkeleton style={{ width: 80, height: 80, borderRadius: 40 }} />
        </View>
      </View>

      {/* Card Placeholder */}
      <View style={styles.section}>
        <AppText variant="heading5">Card Placeholder</AppText>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppSkeleton style={{ width: 48, height: 48, borderRadius: 24 }} />
            <View style={styles.cardHeaderText}>
              <AppSkeleton style={{ width: 120, height: 16 }} />
              <AppSkeleton style={{ width: 80, height: 12 }} />
            </View>
          </View>
          <AppSkeleton style={{ width: "100%", height: 12 }} />
          <AppSkeleton style={{ width: "100%", height: 12 }} />
          <AppSkeleton style={{ width: "70%", height: 12 }} />
        </View>
      </View>

      {/* List Item Placeholder */}
      <View style={styles.section}>
        <AppText variant="heading5">List Items</AppText>
        <View style={styles.column}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.listItem}>
              <AppSkeleton style={{ width: 40, height: 40, borderRadius: 8 }} />
              <View style={styles.listItemText}>
                <AppSkeleton style={{ width: "60%", height: 14 }} />
                <AppSkeleton style={{ width: "40%", height: 12 }} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Image Placeholder */}
      <View style={styles.section}>
        <AppText variant="heading5">Image Placeholder</AppText>
        <AppSkeleton
          style={{ width: "100%", height: 200, borderRadius: radius * 2 }}
        />
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
  column: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius * 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardHeaderText: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
  },
  listItem: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  listItemText: {
    flex: 1,
    gap: spacing.xs,
  },
});
