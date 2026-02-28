import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";

export default function ButtonShowcase() {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Primary */}
      <View style={styles.section}>
        <AppText variant="heading5">Primary</AppText>
        <AppButton>Button</AppButton>
      </View>

      {/* Secondary */}
      <View style={styles.section}>
        <AppText variant="heading5">Secondary</AppText>
        <AppButton variant="secondary">Secondary</AppButton>
      </View>

      {/* Outline */}
      <View style={styles.section}>
        <AppText variant="heading5">Outline</AppText>
        <AppButton variant="outline">Outline</AppButton>
      </View>

      {/* Ghost */}
      <View style={styles.section}>
        <AppText variant="heading5">Ghost</AppText>
        <AppButton variant="ghost">Ghost</AppButton>
      </View>

      {/* Destructive */}
      <View style={styles.section}>
        <AppText variant="heading5">Destructive</AppText>
        <AppButton variant="destructive">Destructive</AppButton>
      </View>

      {/* Link */}
      <View style={styles.section}>
        <AppText variant="heading5">Link</AppText>
        <AppButton variant="link">Link</AppButton>
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Sizes</AppText>
        <View style={styles.row}>
          <AppButton size="sm">Small</AppButton>
          <AppButton size="default">Default</AppButton>
          <AppButton size="lg">Large</AppButton>
        </View>
      </View>

      {/* Icon Buttons */}
      <View style={styles.section}>
        <AppText variant="heading5">Icon Buttons</AppText>
        <View style={styles.row}>
          <AppButton variant="primary" size="icon">
            <AppIcon icon="Plus" size={20} color={theme.primaryForeground} />
          </AppButton>
          <AppButton variant="secondary" size="icon">
            <AppIcon icon="Settings" size={20} color={theme.secondaryForeground} />
          </AppButton>
          <AppButton variant="outline" size="icon">
            <AppIcon icon="Search" size={20} color={theme.foreground} />
          </AppButton>
          <AppButton variant="ghost" size="icon">
            <AppIcon icon="Heart" size={20} color={theme.foreground} />
          </AppButton>
          <AppButton variant="destructive" size="icon">
            <AppIcon icon="Trash2" size={20} color={theme.destructiveForeground} />
          </AppButton>
        </View>
      </View>

      {/* With Icons */}
      <View style={styles.section}>
        <AppText variant="heading5">With Icons</AppText>
        <View style={styles.column}>
          <AppButton>
            <View style={styles.buttonContent}>
              <AppIcon icon="Mail" size={18} color={theme.primaryForeground} />
              <AppText style={{ color: theme.primaryForeground, fontWeight: "600", marginLeft: 8 }}>
                Login with Email
              </AppText>
            </View>
          </AppButton>
          <AppButton variant="outline">
            <View style={styles.buttonContent}>
              <AppIcon icon="Github" size={18} color={theme.foreground} />
              <AppText style={{ color: theme.foreground, fontWeight: "600", marginLeft: 8 }}>
                Continue with GitHub
              </AppText>
            </View>
          </AppButton>
        </View>
      </View>

      {/* Disabled */}
      <View style={styles.section}>
        <AppText variant="heading5">Disabled</AppText>
        <View style={styles.row}>
          <AppButton disabled>Disabled</AppButton>
          <AppButton variant="outline" disabled>Disabled</AppButton>
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
    gap: spacing.sm,
  },
  column: {
    gap: spacing.sm,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
