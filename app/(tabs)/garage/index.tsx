import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function GaragePage() {
  const { t } = useI18n("garage");

  const onAppItemClickHandler = (item: string) => {
    switch (item) {
      case "vehicles":
        router.push("/garage/vehicle");
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <AppText style={styles.title}>{t("title")}</AppText>
        <AppText style={styles.subtitle}>{t("subtitle")}</AppText>
      </View>

      <AppListSectionHeader title={t("garageSection")} />
      <AppListGroup>
        <AppListItem
          icon="Car"
          iconColor="#3b82f6"
          label={t("vehicles")}
          sub={t("vehiclesSub")}
          chevron
          onPress={() => onAppItemClickHandler("vehicles")}
        />
        <AppListItem
          icon="Wrench"
          iconColor="#f59e0b"
          label={t("stationsAndRepairmen")}
          sub={t("stationsAndRepairmenSub")}
          chevron
        />
      </AppListGroup>

      <AppListSectionHeader title={t("expenseSection")} />
      <AppListGroup>
        <AppListItem
          icon="Fuel"
          iconColor="#ef4444"
          label={t("fuelExpense")}
          sub={t("fuelExpenseSub")}
          chevron
        />
        <AppListItem
          icon="Wrench"
          iconColor="#8b5cf6"
          label={t("serviceExpense")}
          sub={t("serviceExpenseSub")}
          chevron
        />
        <AppListItem
          icon="SquareParking"
          iconColor="#06b6d4"
          label={t("parkingExpense")}
          sub={t("parkingExpenseSub")}
          chevron
        />
        <AppListItem
          icon="Droplets"
          iconColor="#0ea5e9"
          label={t("carWashExpense")}
          sub={t("carWashExpenseSub")}
          chevron
        />
        <AppListItem
          icon="Package"
          iconColor="#f97316"
          label={t("accessoryExpense")}
          sub={t("accessoryExpenseSub")}
          chevron
        />
      </AppListGroup>

      <AppListSectionHeader title={t("utilsSection")} />
      <AppListGroup>
        <AppListItem
          icon="CircleParking"
          iconColor="#ef4469"
          label={t("parkPlace")}
          sub={t("parkPlaceSub")}
          chevron
        />
        <AppListItem
          icon="FolderOpen"
          iconColor="#44ef8b"
          label={t("gallery")}
          sub={t("gallerySub")}
          chevron
        />
      </AppListGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md + 2,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
}));
