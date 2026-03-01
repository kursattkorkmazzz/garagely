import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppSwitch } from "@/components/ui/app-switch";
import { spacing } from "@/theme/tokens/spacing";

export default function SwitchShowcase() {
  const [controlledValue, setControlledValue] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Default Switch */}
      <View style={styles.section}>
        <AppText variant="heading5">Default Switch</AppText>
        <AppSwitch />
      </View>

      {/* Controlled Switch */}
      <View style={styles.section}>
        <AppText variant="heading5">Controlled Switch</AppText>
        <AppText variant="bodySmall" color="muted">
          Value: {controlledValue ? "On" : "Off"}
        </AppText>
        <AppSwitch value={controlledValue} onChange={setControlledValue} />
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Sizes</AppText>
        <View style={styles.row}>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Small
            </AppText>
            <AppSwitch size="sm" />
          </View>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Default
            </AppText>
            <AppSwitch size="default" />
          </View>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Large
            </AppText>
            <AppSwitch size="lg" />
          </View>
        </View>
      </View>

      {/* Disabled States */}
      <View style={styles.section}>
        <AppText variant="heading5">Disabled</AppText>
        <View style={styles.row}>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Off
            </AppText>
            <AppSwitch disabled />
          </View>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              On
            </AppText>
            <AppSwitch disabled value={true} />
          </View>
        </View>
      </View>

      {/* Invalid States */}
      <View style={styles.section}>
        <AppText variant="heading5">Invalid</AppText>
        <View style={styles.row}>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Off
            </AppText>
            <AppSwitch invalid value={false} />
          </View>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              On
            </AppText>
            <AppSwitch invalid value={true} />
          </View>
        </View>
      </View>

      {/* Combined States */}
      <View style={styles.section}>
        <AppText variant="heading5">Combined States</AppText>
        <View style={styles.row}>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Invalid + Disabled
            </AppText>
            <AppSwitch invalid disabled />
          </View>
          <View style={styles.sizeItem}>
            <AppText variant="bodySmall" color="muted">
              Large + Invalid
            </AppText>
            <AppSwitch size="lg" invalid />
          </View>
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
  sizeItem: {
    gap: spacing.xs,
    alignItems: "center",
  },
});
