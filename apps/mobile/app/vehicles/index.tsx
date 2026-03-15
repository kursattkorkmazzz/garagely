import { useState, useCallback, useMemo } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { VehicleCard, VehicleCardData } from "@/components/garage";
import { AppListEmpty } from "@/components/common";
import { appToast } from "@/components/ui/app-toast";
import { spacing } from "@/theme/tokens/spacing";
import { sdk } from "@/stores/sdk";
import type { DetailedVehicleModel } from "@garagely/shared/models/vehicle";
import { getCurrencySymbol } from "@/utils/currency.utils";

function mapToVehicleCardData(
  vehicle: DetailedVehicleModel,
  currencySymbol: string,
): VehicleCardData {
  return {
    id: vehicle.id,
    name: `${vehicle.brand.name} ${vehicle.model.name}`,
    licensePlate: vehicle.plate ?? "—",
    modelYear: vehicle.model.year ?? null,
    costPerKm: `${currencySymbol}0`, // Placeholder until implemented
    inspectionExpireDate: undefined, // Placeholder until implemented
    insuranceExpireDate: undefined, // Placeholder until implemented
    coverImage: vehicle.coverPhoto?.url,
    color: vehicle.color ?? undefined,
  };
}

export default function VehicleListScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const user = useStore((state) => state.user.user);

  const [vehicles, setVehicles] = useState<DetailedVehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currencySymbol = useMemo(
    () => getCurrencySymbol(user?.preferences?.preferredCurrency),
    [user?.preferences?.preferredCurrency],
  );

  const fetchVehicles = useCallback(() => {
    setIsLoading(true);
    sdk.vehicle.getDetailedVehicles({
      onSuccess: (response) => {
        setVehicles(response.data);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [fetchVehicles])
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleAddPress = () => {
    router.push("/vehicles/add");
  };

  const handleVehiclePress = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  const handleDeletePress = (vehicleId: string) => {
    Alert.alert(
      t("vehicles.deleteConfirm.title"),
      t("vehicles.deleteConfirm.message"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => {
            sdk.vehicle.deleteVehicle(vehicleId, {
              onSuccess: () => {
                setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
                appToast.success(t("vehicles.deleted"));
              },
              onError: () => {
                appToast.error(t("errors.generic"));
              },
            });
          },
        },
      ],
    );
  };

  const vehicleCards = vehicles.map((v) => mapToVehicleCardData(v, currencySymbol));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppButton variant="ghost" size="sm" onPress={handleBackPress}>
            <AppIcon icon="ArrowLeft" size={24} color={theme.foreground} />
          </AppButton>
          <View>
            <AppText variant="heading2">{t("vehicles.title")}</AppText>
            <AppText variant="caption" color="muted">
              {t("vehicles.total", { count: vehicles.length })}
            </AppText>
          </View>
        </View>
        <AppButton variant="primary" size="sm" onPress={handleAddPress}>
          <View style={styles.addButtonContent}>
            <AppIcon icon="Plus" size={18} color={theme.primaryForeground} />
            <AppText
              style={{ color: theme.primaryForeground, fontWeight: "600" }}
            >
              {t("vehicles.add")}
            </AppText>
          </View>
        </AppButton>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Empty State */}
      {!isLoading && vehicles.length === 0 && (
        <View style={styles.emptyContainer}>
          <AppListEmpty
            icon="Car"
            title={t("vehicles.empty.title")}
            description={t("vehicles.empty.description")}
          />
        </View>
      )}

      {/* Vehicle List */}
      {!isLoading && vehicles.length > 0 && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {vehicleCards.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => handleVehiclePress(vehicle.id)}
              onDeletePress={() => handleDeletePress(vehicle.id)}
            />
          ))}
        </ScrollView>
      )}
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
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
