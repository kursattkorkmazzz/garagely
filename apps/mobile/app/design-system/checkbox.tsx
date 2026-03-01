import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppCheckbox } from "@/components/ui/app-checkbox";
import { spacing } from "@/theme/tokens/spacing";

export default function CheckboxShowcase() {
  const [checked, setChecked] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Default Checkbox */}
      <View style={styles.section}>
        <AppText variant="heading5">Default Checkbox</AppText>
        <AppCheckbox />
      </View>

      {/* Controlled Checkbox */}
      <View style={styles.section}>
        <AppText variant="heading5">Controlled Checkbox</AppText>
        <AppText variant="bodySmall" color="muted">
          Checked: {checked ? "Yes" : "No"}
        </AppText>
        <AppCheckbox checked={checked} onChange={setChecked} />
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Sizes</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Small
            </AppText>
            <AppCheckbox size="sm" />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Default
            </AppText>
            <AppCheckbox size="default" />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Large
            </AppText>
            <AppCheckbox size="lg" />
          </View>
        </View>
      </View>

      {/* States */}
      <View style={styles.section}>
        <AppText variant="heading5">States</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Unchecked
            </AppText>
            <AppCheckbox checked={false} />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Checked
            </AppText>
            <AppCheckbox checked={true} />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Disabled
            </AppText>
            <AppCheckbox disabled />
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Checked + Disabled
            </AppText>
            <AppCheckbox checked={true} disabled />
          </View>
        </View>
      </View>

      {/* With Label */}
      <View style={styles.section}>
        <AppText variant="heading5">With Label</AppText>
        <View style={styles.labelRow}>
          <AppCheckbox />
          <AppText>I agree to the terms and conditions</AppText>
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
  item: {
    gap: spacing.xs,
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
