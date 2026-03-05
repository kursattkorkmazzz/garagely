import { useEffect, useCallback, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import type { VehicleModel } from "@garagely/shared/models/vehicle";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const { theme } = useTheme();
  if (!value) return null;
  return (
    <View
      style={[styles.detailRow, { borderBottomColor: theme.border }]}
    >
      <AppText variant="caption" color="muted" style={styles.detailLabel}>
        {label}
      </AppText>
      <AppText variant="bodyMedium">{value}</AppText>
    </View>
  );
}

export default function VehicleDetailScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { vehicles, isLoadingVehicles, fetchVehicles, deleteVehicle, uploadCover } =
    useStore((state) => state.vehicle);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (vehicles.length === 0) {
      fetchVehicles();
    }
  }, [vehicles.length, fetchVehicles]);

  const vehicle: VehicleModel | undefined = vehicles.find((v) => v.id === id);

  const displayName = (() => {
    if (!vehicle) return "";
    const brand = vehicle.brandName ?? "";
    const model = vehicle.modelName ?? "";
    return brand && model
      ? `${brand} ${model}`
      : brand || model || vehicle.plate || vehicle.id;
  })();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t("vehicles.details.title"),
      t("vehicles.details.confirmDelete"),
      [
        { text: t("common:buttons.cancel"), style: "cancel" },
        {
          text: t("common:buttons.delete"),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            await deleteVehicle(id!, {
              onSuccess: () => {
                router.back();
              },
              onError: () => {
                setIsDeleting(false);
              },
            });
          },
        },
      ],
    );
  }, [id, deleteVehicle, router, t]);

  const handleEditCover = useCallback(async () => {
    if (!id) return;

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
      await uploadCover(id, result.assets[0].uri);
    }
  }, [id, uploadCover]);

  if (isLoadingVehicles && !vehicle) {
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
        <AppIcon icon="Car" size={48} color={theme.mutedForeground} />
        <AppText variant="bodyMedium" color="muted" style={styles.notFoundText}>
          Vehicle not found
        </AppText>
        <AppButton
          variant="secondary"
          size="sm"
          onPress={handleBack}
          style={styles.backButtonCentered}
        >
          {t("common:buttons.back")}
        </AppButton>
      </View>
    );
  }

  const formattedPurchaseDate = vehicle.purchaseDate
    ? new Date(vehicle.purchaseDate).toLocaleDateString()
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: theme.border }]}
      >
        <AppButton variant="ghost" size="sm" onPress={handleBack}>
          <AppIcon icon="ArrowLeft" size={24} color={theme.foreground} />
        </AppButton>
        <AppText variant="heading2" style={styles.headerTitle}>
          {displayName}
        </AppText>
        {isDeleting ? (
          <ActivityIndicator size="small" color={theme.destructive} />
        ) : (
          <AppButton variant="ghost" size="sm" onPress={handleDelete}>
            <AppIcon icon="Trash2" size={20} color={theme.destructive} />
          </AppButton>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo Section */}
        <View
          style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.sectionHeader}>
            <AppText variant="bodyLarge" style={styles.sectionTitle}>
              {t("vehicles.details.editCover")}
            </AppText>
            <AppButton variant="ghost" size="sm" onPress={handleEditCover}>
              <AppIcon icon="Camera" size={20} color={theme.primary} />
            </AppButton>
          </View>
          {vehicle.coverPhoto?.url ? (
            <AppText variant="caption" color="muted">
              {vehicle.coverPhoto.url.substring(0, 40)}...
            </AppText>
          ) : (
            <AppText variant="caption" color="muted">
              No cover photo
            </AppText>
          )}
        </View>

        {/* Vehicle Info Section */}
        <View
          style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <DetailRow
            label={t("vehicles.details.brand")}
            value={vehicle.brandName}
          />
          <DetailRow
            label={t("vehicles.details.model")}
            value={vehicle.modelName}
          />
          <DetailRow
            label={t("vehicles.details.year")}
            value={vehicle.modelYear ? String(vehicle.modelYear) : null}
          />
          <DetailRow
            label={t("vehicles.details.plate")}
            value={vehicle.plate}
          />
          <DetailRow label={t("vehicles.details.vin")} value={vehicle.vin} />
          <DetailRow
            label={t("vehicles.details.color")}
            value={vehicle.color}
          />
        </View>

        {/* Mileage & Purchase Section */}
        <View
          style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <DetailRow
            label={t("vehicles.details.currentKm")}
            value={
              vehicle.currentKm != null
                ? `${vehicle.currentKm.toLocaleString()} km`
                : null
            }
          />
          <DetailRow
            label={t("vehicles.details.purchaseDate")}
            value={formattedPurchaseDate}
          />
          <DetailRow
            label={t("vehicles.details.purchasePrice")}
            value={
              vehicle.purchasePrice != null
                ? String(vehicle.purchasePrice)
                : null
            }
          />
          <DetailRow
            label={t("vehicles.details.purchaseKm")}
            value={
              vehicle.purchaseKm != null
                ? `${vehicle.purchaseKm.toLocaleString()} km`
                : null
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  notFoundText: {
    textAlign: "center",
  },
  backButtonCentered: {
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    borderRadius: radius * 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  detailLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
