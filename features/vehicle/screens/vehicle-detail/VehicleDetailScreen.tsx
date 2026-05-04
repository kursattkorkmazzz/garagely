import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppText } from "@/components/ui/app-text";
import { AppToggle } from "@/components/ui/app-toggle";
import Icon from "@/components/ui/icon";
import { Vehicle } from "@/features/vehicle/entity/vehicle.entity";
import { VehicleService } from "@/features/vehicle/service/vehicle.service";
import { formatDateTime } from "@/components/ui/app-date-picker/date-time-utils";
import { useI18n } from "@/i18n";
import { useUserPreferencesStore } from "@/stores/user-preferences.store";
import { useVehicleStore } from "@/stores/vehicle.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type VehicleDetailScreenProps = {
  id: string;
};

export function VehicleDetailScreen({ id }: VehicleDetailScreenProps) {
  const { t } = useI18n("vehicle");
  const { theme } = useUnistyles();
  const { activeVehicleId, setActiveVehicle } = useVehicleStore();
  const { timezone, language } = useUserPreferencesStore();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      VehicleService.getById(id).then((v) => {
        setVehicle(v);
        setLoading(false);
      });
    }, [id]),
  );

  const isActive = activeVehicleId === id;

  const handleActivate = async () => {
    if (isActive) return;
    await setActiveVehicle(id).catch(handleUIError);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!vehicle) return null;

  const hasCoverPhoto = !!vehicle.coverPhoto?.fullPath;
  const hasPurchaseInfo = !!vehicle.purchase?.amount;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        {hasCoverPhoto ? (
          <Image
            source={{ uri: vehicle.coverPhoto!.fullPath }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[styles.coverPlaceholder, { backgroundColor: vehicle.color }]}
          >
            <Icon name="Car" size={64} color="#ffffff" />
          </View>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <AppText style={styles.vehicleName}>
          {vehicle.brand} {vehicle.model}
        </AppText>
        <View style={styles.titleMeta}>
          <AppText style={styles.vehicleYear}>{vehicle.year}</AppText>
          <View
            style={[
              styles.plateBadge,
              {
                backgroundColor: theme.utils.withOpacity(
                  theme.colors.foreground,
                  0.08,
                ),
              },
            ]}
          >
            <AppText style={styles.plateText}>{vehicle.plate}</AppText>
          </View>
        </View>
      </View>

      {/* Active Vehicle */}
      <View style={styles.section}>
        <AppListGroup>
          <AppListItem
            label={isActive ? t("detail.activeVehicle") : t("detail.setAsActive")}
            icon="Star"
            iconColor={isActive ? theme.colors.primary : theme.colors.mutedForeground}
            onPress={isActive ? undefined : handleActivate}
            trailing={<AppToggle value={isActive} />}
          />
        </AppListGroup>
      </View>

      {/* Specs */}
      <View style={styles.section}>
        <AppText style={styles.sectionLabel}>{t("detail.specs")}</AppText>
        <AppListGroup>
          <AppListItem
            label={t("fields.fuelType")}
            icon="Fuel"
            iconColor={theme.colors.primary}
            selectedValue={t(`fuelType.${vehicle.fuelType}`)}
          />
          <AppListItem
            label={t("fields.transmissionType")}
            icon="Settings2"
            iconColor={theme.colors.primary}
            selectedValue={t(`transmissionType.${vehicle.transmissionType}`)}
          />
          <AppListItem
            label={t("fields.bodyType")}
            icon="Car"
            iconColor={theme.colors.primary}
            selectedValue={t(`bodyType.${vehicle.bodyType}`)}
          />
          <AppListItem
            label={t("fields.color")}
            icon="Palette"
            iconColor={theme.colors.primary}
            trailing={
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: vehicle.color },
                ]}
              />
            }
            selectedValue={vehicle.color}
          />
        </AppListGroup>
      </View>

      {/* Purchase Info */}
      {hasPurchaseInfo && (
        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>{t("detail.purchase")}</AppText>
          <AppListGroup>
            <AppListItem
              label={t("fields.purchaseAmount")}
              icon="Banknote"
              iconColor={theme.colors.primary}
              selectedValue={`${vehicle.purchase!.amount} ${vehicle.purchase!.currency ?? ""}`}
            />
            {vehicle.purchaseDate ? (
              <AppListItem
                label={t("fields.purchaseDate")}
                icon="Calendar"
                iconColor={theme.colors.primary}
                selectedValue={formatDateTime(vehicle.purchaseDate, timezone, language)}
              />
            ) : null}
          </AppListGroup>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  vehicleName: {
    ...theme.typography.heading2,
    color: theme.colors.foreground,
  },
  titleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  vehicleYear: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
  },
  plateBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.sm,
  },
  plateText: {
    ...theme.typography.caption,
    color: theme.colors.foreground,
    fontWeight: "600",
    letterSpacing: 1,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.mutedForeground,
    paddingHorizontal: theme.spacing.md + theme.spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}));
