import { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardContent,
} from "@/components/ui/app-card";
import { appToast } from "@/components/ui/app-toast";
import { showApiError } from "@/utils/show-api-error";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import { sdk } from "@/stores/sdk";
import { Currency } from "@garagely/shared/models/unit";
import type { DetailedVehicleModel } from "@garagely/shared/models/vehicle";
import {
  VehicleDetailHero,
  VehicleDetailRow,
} from "@/components/vehicle/vehicle-detail";

function getCurrencySymbol(currency: Currency | undefined): string {
  switch (currency) {
    case Currency.EUR:
      return "\u20AC";
    case Currency.GBP:
      return "\u00A3";
    case Currency.TRY:
      return "\u20BA";
    case Currency.USD:
    default:
      return "$";
  }
}

function maskVin(vin: string | null | undefined): string {
  if (!vin) return "";
  if (vin.length <= 5) return vin;
  return vin.slice(0, -5) + "*****";
}

function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(
  price: number | null | undefined,
  symbol: string,
): string | null {
  if (price === null || price === undefined) return null;
  return `${symbol}${price.toLocaleString()}`;
}

function formatKm(km: number | null | undefined): string | null {
  if (km === null || km === undefined) return null;
  return `${km.toLocaleString()} km`;
}

export default function VehicleDetailScreen() {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useStore((state) => state.user.user);

  const [vehicle, setVehicle] = useState<DetailedVehicleModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currencySymbol = useMemo(
    () => getCurrencySymbol(user?.preferences?.preferredCurrency),
    [user?.preferences?.preferredCurrency],
  );

  const unknown = t("unknown");

  const fetchVehicle = useCallback(() => {
    if (!id) return;
    setIsLoading(true);
    sdk.vehicle.getDetailedVehicleById(id, {
      onSuccess: (response) => {
        console.log(response);

        setVehicle(response.data);
        setIsLoading(false);
      },
      onError: (error) => {
        showApiError(error);
        setIsLoading(false);
      },
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchVehicle();
    }, [fetchVehicle]),
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleEditPress = () => {
    appToast(t("toast.comingSoon", { feature: t("buttons.edit") }));
  };

  const handleDeletePress = () => {
    if (!vehicle) return;
    Alert.alert(
      t("vehicles.deleteConfirm.title"),
      t("vehicles.deleteConfirm.message"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => {
            sdk.vehicle.deleteVehicle(vehicle.id, {
              onSuccess: () => {
                appToast.success(t("vehicles.deleted"));
                router.back();
              },
              onError: showApiError,
            });
          },
        },
      ],
    );
  };

  // Selected vehicle logic - hardcoded to false for now
  const isSelected = false;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <AppText color="muted">{t("errors.generic")}</AppText>
      </View>
    );
  }

  const vehicleName = `${vehicle.brand.name} ${vehicle.model.name}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppButton variant="ghost" size="icon" onPress={handleBackPress}>
          <AppIcon icon="ArrowLeft" size={24} color={theme.foreground} />
        </AppButton>
        <AppText variant="heading3">{t("vehicleDetail.title")}</AppText>
        <View style={styles.headerActions}>
          <AppButton variant="ghost" size="icon" onPress={handleEditPress}>
            <AppIcon icon="Pencil" size={20} color={theme.foreground} />
          </AppButton>
          <AppButton variant="ghost" size="icon" onPress={handleDeletePress}>
            <AppIcon icon="Trash2" size={20} color={theme.destructive} />
          </AppButton>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <VehicleDetailHero
          coverImage={vehicle.coverPhoto?.url}
          color={vehicle.color ?? undefined}
          vehicleName={vehicleName}
          licensePlate={vehicle.plate || unknown}
          isSelected={isSelected}
        />

        {/* Technical Specs Card */}
        <AppCard style={styles.card}>
          <AppCardHeader>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: withOpacity(theme.primary, 0.15) },
                ]}
              >
                <AppIcon icon="Settings2" size={18} color={theme.primary} />
              </View>
              <AppCardTitle>
                {t("vehicleDetail.sections.technicalSpecs")}
              </AppCardTitle>
            </View>
          </AppCardHeader>
          <AppCardContent>
            <VehicleDetailRow
              label={t("vehicleDetail.fields.brand")}
              value={vehicle.brand.name || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.model")}
              value={vehicle.model.name || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.year")}
              value={vehicle.model.year?.toString() || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.transmission")}
              value={vehicle.transmissionType?.type || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.bodyType")}
              value={vehicle.bodyType?.type || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.fuelType")}
              value={vehicle.fuelType?.type || unknown}
            />
          </AppCardContent>
        </AppCard>

        {/* Status & ID Card */}
        <AppCard style={styles.card}>
          <AppCardHeader>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: withOpacity("#3B82F6", 0.15) },
                ]}
              >
                <AppIcon icon="Info" size={18} color="#3B82F6" />
              </View>
              <AppCardTitle>
                {t("vehicleDetail.sections.statusId")}
              </AppCardTitle>
            </View>
          </AppCardHeader>
          <AppCardContent>
            <VehicleDetailRow
              label={t("vehicleDetail.fields.currentKm")}
              value={formatKm(vehicle.currentKm) || unknown}
              valueColor="#22C55E"
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.vin")}
              value={maskVin(vehicle.vin) || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.color")}
              value={vehicle.color || unknown}
              colorDot={vehicle.color ?? undefined}
            />
          </AppCardContent>
        </AppCard>

        {/* Ownership History Card */}
        <AppCard style={styles.card}>
          <AppCardHeader>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: withOpacity("#8B5CF6", 0.15) },
                ]}
              >
                <AppIcon icon="RefreshCw" size={18} color="#8B5CF6" />
              </View>
              <AppCardTitle>
                {t("vehicleDetail.sections.ownershipHistory")}
              </AppCardTitle>
            </View>
          </AppCardHeader>
          <AppCardContent>
            <VehicleDetailRow
              label={t("vehicleDetail.fields.purchaseDate")}
              value={formatDate(vehicle.purchaseDate) || unknown}
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.purchasePrice")}
              value={
                formatPrice(vehicle.purchasePrice, currencySymbol) || unknown
              }
            />
            <VehicleDetailRow
              label={t("vehicleDetail.fields.purchaseKm")}
              value={formatKm(vehicle.purchaseKm) || unknown}
            />
          </AppCardContent>
        </AppCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius,
    alignItems: "center",
    justifyContent: "center",
  },
});
