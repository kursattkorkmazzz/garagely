import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppHeader } from "@/components/ui/app-header";
import { spacing } from "@/theme/tokens/spacing";

export default function AlertsScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader title={t("common:tabs.alerts")} />

      <AppText variant="bodyMedium" color="muted" style={styles.subtitle}>
        Your notifications will appear here
      </AppText>
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
});
