import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppHeader } from "@/components/ui/app-header";
import { AppListSection, AppListItem } from "@/components/ui/app-list";
import { spacing } from "@/theme/tokens/spacing";

export default function GarageScreen() {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader title={t("garage.title")} />

      {/* Vehicle Management */}
      <AppListSection title={t("garage.sections.vehicleManagement")}>
        <AppListItem
          icon="Car"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title={t("garage.items.vehicleDetails")}
          subtitle={t("garage.items.vehicleDetailsSubtitle")}
          onPress={() => router.push("/vehicles")}
        />
        <AppListItem
          icon="History"
          iconColor="#14B8A6"
          iconBackgroundColor={withOpacity("#14B8A6", 0.15)}
          title={t("garage.items.ownershipHistory")}
          subtitle={t("garage.items.ownershipHistorySubtitle")}
          onPress={() => {}}
        />
      </AppListSection>

      {/* Financial */}
      <AppListSection title={t("garage.sections.financial")}>
        <AppListItem
          icon="Fuel"
          iconColor="#F59E0B"
          iconBackgroundColor={withOpacity("#F59E0B", 0.15)}
          title={t("garage.items.fuelRecords")}
          subtitle={t("garage.items.fuelRecordsSubtitle")}
          onPress={() => {}}
        />
        <AppListItem
          icon="Receipt"
          iconColor="#8B5CF6"
          iconBackgroundColor={withOpacity("#8B5CF6", 0.15)}
          title={t("garage.items.taxTolls")}
          subtitle={t("garage.items.taxTollsSubtitle")}
          onPress={() => {}}
        />
        <AppListItem
          icon="BarChart3"
          iconColor="#EF4444"
          iconBackgroundColor={withOpacity("#EF4444", 0.15)}
          title={t("garage.items.expenseReports")}
          subtitle={t("garage.items.expenseReportsSubtitle")}
          onPress={() => {}}
        />
      </AppListSection>

      {/* Maintenance */}
      <AppListSection title={t("garage.sections.maintenance")}>
        <AppListItem
          icon="Wrench"
          iconColor="#6366F1"
          iconBackgroundColor={withOpacity("#6366F1", 0.15)}
          title={t("garage.items.serviceLog")}
          subtitle={t("garage.items.serviceLogSubtitle")}
          onPress={() => {}}
        />
        <AppListItem
          icon="CalendarClock"
          iconColor="#22C55E"
          iconBackgroundColor={withOpacity("#22C55E", 0.15)}
          title={t("garage.items.upcomingTasks")}
          subtitle={t("garage.items.upcomingTasksSubtitle")}
          onPress={() => {}}
        />
      </AppListSection>

      {/* Documents */}
      <AppListSection title={t("garage.sections.documents")}>
        <AppListItem
          icon="ShieldCheck"
          iconColor="#0EA5E9"
          iconBackgroundColor={withOpacity("#0EA5E9", 0.15)}
          title={t("garage.items.insurancePolicy")}
          subtitle={t("garage.items.insurancePolicySubtitle", { days: 45 })}
          onPress={() => {}}
        />
        <AppListItem
          icon="FolderOpen"
          iconColor="#64748B"
          iconBackgroundColor={withOpacity("#64748B", 0.15)}
          title={t("garage.items.digitalVault")}
          subtitle={t("garage.items.digitalVaultSubtitle")}
          onPress={() => {}}
        />
      </AppListSection>
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
});
