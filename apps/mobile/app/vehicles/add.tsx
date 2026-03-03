import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { AddVehicleWizard } from "@/components/vehicle";
import { spacing } from "@/theme/tokens/spacing";
import { AppButton } from "@/components/ui/app-button";

export default function AddVehicleScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppButton variant="ghost" size="sm" onPress={() => router.back()}>
          <AppIcon icon="X" size={24} color={theme.foreground} />
        </AppButton>
        <AppText variant="heading3" style={styles.headerTitle}>
          {t("addVehicle.title")}
        </AppText>
        <View style={styles.headerRight} />
      </View>

      {/* Wizard */}
      <AddVehicleWizard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
});
