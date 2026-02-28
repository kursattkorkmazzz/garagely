import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppSpinner } from "@/components/ui/app-spinner";
import { spacing } from "@/theme/tokens/spacing";
import { useTheme } from "@/theme/theme-context";

export default function SpinnerShowcase() {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Default Spinner */}
      <View style={styles.section}>
        <AppText variant="heading5">Default Spinner</AppText>
        <AppSpinner />
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Sizes</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Small
            </AppText>
            <AppSpinner size="sm" />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Default
            </AppText>
            <AppSpinner size="default" />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Large
            </AppText>
            <AppSpinner size="lg" />
          </View>
        </View>
      </View>

      {/* Custom Colors */}
      <View style={styles.section}>
        <AppText variant="heading5">Custom Colors</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Primary
            </AppText>
            <AppSpinner color={theme.primary} />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Destructive
            </AppText>
            <AppSpinner color={theme.destructive} />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Green
            </AppText>
            <AppSpinner color={theme.color.green} />
          </View>
        </View>
      </View>

      {/* With Text */}
      <View style={styles.section}>
        <AppText variant="heading5">With Text</AppText>
        <View style={styles.rowCentered}>
          <AppSpinner size="sm" />
          <AppText variant="bodyMedium">Loading...</AppText>
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
    gap: spacing.lg,
    flexWrap: "wrap",
  },
  rowCentered: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  item: {
    gap: spacing.xs,
    alignItems: "center",
  },
});
