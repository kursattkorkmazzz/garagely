import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppDivider } from "@/components/ui/app-divider";
import { spacing } from "@/theme/tokens/spacing";

export default function DividerShowcase() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Simple Divider */}
      <View style={styles.section}>
        <AppText variant="heading5">Simple Divider</AppText>
        <AppDivider />
      </View>

      {/* Divider with Text */}
      <View style={styles.section}>
        <AppText variant="heading5">Divider with Text</AppText>
        <AppDivider text="OR" />
      </View>

      {/* Divider with Longer Text */}
      <View style={styles.section}>
        <AppText variant="heading5">Longer Text</AppText>
        <AppDivider text="OR CONTINUE WITH" />
      </View>

      {/* In Context */}
      <View style={styles.section}>
        <AppText variant="heading5">In Context</AppText>
        <View style={styles.contextBox}>
          <AppText variant="bodyMedium">Content above</AppText>
          <AppDivider text="SECTION" />
          <AppText variant="bodyMedium">Content below</AppText>
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
  contextBox: {
    gap: spacing.md,
    padding: spacing.md,
  },
});
