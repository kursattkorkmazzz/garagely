import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppHeader } from "@/components/ui/app-header";
import { spacing } from "@/theme/tokens/spacing";

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader title={t("common:tabs.dashboard")} />

      <AppText variant="bodyMedium" color="muted" style={styles.subtitle}>
        Your dashboard overview
      </AppText>
      <AppButton
        variant="secondary"
        onPress={() => router.push("/(tabs)/design-system")}
        style={styles.button}
      >
        Design System
      </AppButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.xl,
    width: "100%",
  },
});
