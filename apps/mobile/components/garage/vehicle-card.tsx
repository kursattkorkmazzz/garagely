import { View, StyleSheet, ImageBackground, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { AppBadge } from "@/components/ui/app-badge";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

export type VehicleCardData = {
  id: string;
  name: string;
  licensePlate: string;
  modelYear: number;
  mileage: number;
  costPerKm: number;
  lastServiceDate?: string;
  isOverdue?: boolean;
  coverImage?: string;
  color?: string; // Hex color for gradient when no cover image
};

type VehicleCardProps = {
  vehicle: VehicleCardData;
  onPress?: () => void;
  onCameraPress?: () => void;
};

export function VehicleCard({
  vehicle,
  onPress,
  onCameraPress,
}: VehicleCardProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();

  const defaultColor = "#3B82F6";
  const vehicleColor = vehicle.color || defaultColor;

  const formatMileage = (km: number) => {
    return km.toLocaleString() + " km";
  };

  const formatCost = (cost: number) => {
    return "$" + cost.toFixed(2);
  };

  const renderCoverSection = () => {
    const content = (
      <>
        {/* Vehicle name and plate */}
        <View style={styles.coverContent}>
          <AppText variant="heading2" style={styles.vehicleName}>
            {vehicle.name}
          </AppText>
          <AppBadge
            variant="secondary"
            style={[
              styles.plateBadge,
              { backgroundColor: withOpacity("#000000", 0.5) },
            ]}
          >
            <AppText variant="caption" style={{ color: "#FFFFFF" }}>
              {vehicle.licensePlate}
            </AppText>
          </AppBadge>
        </View>

        {/* Camera button */}
        <Pressable
          style={[
            styles.cameraButton,
            { backgroundColor: withOpacity("#000000", 0.4) },
          ]}
          onPress={onCameraPress}
        >
          <AppIcon icon="Camera" size={20} color="#FFFFFF" />
        </Pressable>
      </>
    );

    if (vehicle.coverImage) {
      return (
        <ImageBackground
          source={{ uri: vehicle.coverImage }}
          style={styles.coverSection}
          imageStyle={styles.coverImage}
        >
          <LinearGradient
            colors={["transparent", withOpacity("#000000", 0.7)]}
            style={styles.imageOverlay}
          >
            {content}
          </LinearGradient>
        </ImageBackground>
      );
    }

    // Gradient background when no cover image
    // Pattern: black (top-left) -> vehicle color (center) -> black (bottom-right)
    return (
      <LinearGradient
        colors={["#000000", vehicleColor, "#000000"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.coverSection}
      >
        {content}
      </LinearGradient>
    );
  };

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
    >
      {renderCoverSection()}

      {/* Stats Section */}
      <View style={styles.statsSection}>
        {/* Row 1: Model Year and Mileage */}
        <View style={[styles.statsRow, { borderBottomColor: theme.border }]}>
          <View style={styles.statItem}>
            <AppText variant="caption" color="muted" style={styles.statLabel}>
              {t("vehicles.card.modelYear")}
            </AppText>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {vehicle.modelYear}
            </AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="caption" color="muted" style={styles.statLabel}>
              {t("vehicles.card.mileage")}
            </AppText>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {formatMileage(vehicle.mileage)}
            </AppText>
          </View>
        </View>

        {/* Row 2: Cost/KM and Last Service */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statLabelRow}>
              <AppIcon icon="Fuel" size={14} color="#22C55E" />
              <AppText variant="caption" color="muted" style={styles.statLabel}>
                {t("vehicles.card.costPerKm")}
              </AppText>
            </View>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {formatCost(vehicle.costPerKm)}
            </AppText>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statLabelRow}>
              <AppIcon
                icon={vehicle.isOverdue ? "AlertTriangle" : "Wrench"}
                size={14}
                color={vehicle.isOverdue ? theme.destructive : "#8B5CF6"}
              />
              <AppText
                variant="caption"
                style={[
                  styles.statLabel,
                  {
                    color: vehicle.isOverdue
                      ? theme.destructive
                      : theme.mutedForeground,
                  },
                ]}
              >
                {vehicle.isOverdue
                  ? t("vehicles.card.overdue")
                  : t("vehicles.card.lastService")}
              </AppText>
            </View>
            <View style={styles.serviceRow}>
              <AppText
                variant="bodyLarge"
                style={[
                  styles.statValue,
                  vehicle.isOverdue && { color: theme.destructive },
                ]}
              >
                {vehicle.lastServiceDate || "-"}
              </AppText>
              {vehicle.isOverdue && (
                <View
                  style={[
                    styles.overdueDot,
                    { backgroundColor: theme.destructive },
                  ]}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius * 2,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  coverSection: {
    height: 180,
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  coverImage: {
    borderTopLeftRadius: radius * 2,
    borderTopRightRadius: radius * 2,
  },
  imageOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.md,
    margin: -spacing.md,
  },
  coverContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  vehicleName: {
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  plateBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cameraButton: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statsSection: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontWeight: "600",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  overdueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
