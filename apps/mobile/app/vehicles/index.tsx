import { useEffect, useCallback } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { VehicleCard, VehicleCardData } from "@/components/garage";
import { spacing } from "@/theme/tokens/spacing";
import type { VehicleModel } from "@garagely/shared/models/vehicle";

function toVehicleCardData(vehicle: VehicleModel): VehicleCardData {
  const brandName = vehicle.brandName ?? "";
  const modelName = vehicle.modelName ?? "";
  const name =
    brandName && modelName
      ? `${brandName} ${modelName}`
      : brandName || modelName || vehicle.plate || vehicle.id;

  return {
    id: vehicle.id,
    name,
    licensePlate: vehicle.plate ?? "-",
    modelYear: vehicle.modelYear ?? 0,
    mileage: vehicle.currentKm ?? 0,
    costPerKm: 0,
    coverImage: vehicle.coverPhoto?.url ?? undefined,
    color: vehicle.color ?? undefined,
  };
}

export default function VehicleListScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { vehicles, isLoadingVehicles, fetchVehicles, uploadCover } = useStore(
    (state) => state.vehicle,
  );

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddPress = () => {
    router.push("/vehicles/add");
  };

  const handleVehiclePress = (vehicle: VehicleCardData) => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  const handleCameraPress = useCallback(
    async (vehicle: VehicleCardData) => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadCover(vehicle.id, result.assets[0].uri);
      }
    },
    [uploadCover],
  );

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

      {/* Loading state */}
      {isLoadingVehicles && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Vehicle List */}
      {!isLoadingVehicles && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {vehicles.map((vehicle) => {
            const cardData = toVehicleCardData(vehicle);
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={cardData}
                onPress={() => handleVehiclePress(cardData)}
                onCameraPress={() => handleCameraPress(cardData)}
              />
            );
          })}
          {vehicles.length === 0 && (
            <View style={styles.emptyContainer}>
              <AppIcon icon="Car" size={48} color={theme.mutedForeground} />
              <AppText
                variant="bodyMedium"
                color="muted"
                style={styles.emptyText}
              >
                {t("vehicles.empty")}
              </AppText>
              <AppButton
                variant="primary"
                size="sm"
                onPress={handleAddPress}
                style={styles.emptyButton}
              >
                {t("vehicles.add")}
              </AppButton>
            </View>
          )}
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
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    textAlign: "center",
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
});
