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
  modelYear: number | null;
  costPerKm: string; // Formatted with currency symbol
  inspectionExpireDate?: string;
  insuranceExpireDate?: string;
  coverImage?: string;
  color?: string; // Hex color for gradient when no cover image
};

type VehicleCardProps = {
  vehicle: VehicleCardData;
  onPress?: () => void;
  onDeletePress?: () => void;
};

export function VehicleCard({
  vehicle,
  onPress,
  onDeletePress,
}: VehicleCardProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();

  const defaultColor = "#3B82F6";
  const vehicleColor = vehicle.color || defaultColor;

  const renderCoverSection = () => {
    const content = (
      <>
        {/* Delete button */}
        <Pressable
          style={[
            styles.deleteButton,
            { backgroundColor: withOpacity("#000000", 0.4) },
          ]}
          onPress={onDeletePress}
        >
          <AppIcon icon="Trash2" size={18} color="#FFFFFF" />
        </Pressable>

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
      </>
    );

    if (vehicle.coverImage) {
      return (
        <ImageBackground
          source={{ uri: vehicle.coverImage }}
          style={styles.coverSection}
          imageStyle={styles.coverImage}
        >
          {content}
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
        {/* Row 1: Model Year and Cost/KM */}
        <View style={[styles.statsRow, { borderBottomColor: theme.border }]}>
          <View style={styles.statItem}>
            <AppText variant="caption" color="muted" style={styles.statLabel}>
              {t("vehicles.card.modelYear")}
            </AppText>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {vehicle.modelYear || t("vehicles.card.unknown")}
            </AppText>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statLabelRow}>
              <AppIcon icon="Fuel" size={14} color="#22C55E" />
              <AppText variant="caption" color="muted" style={styles.statLabel}>
                {t("vehicles.card.costPerKm")}
              </AppText>
            </View>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {vehicle.costPerKm}
            </AppText>
          </View>
        </View>

        {/* Row 2: Inspection Expire and Insurance Expire */}
        <View style={[styles.statsRow, { borderBottomWidth: 0 }]}>
          <View style={styles.statItem}>
            <View style={styles.statLabelRow}>
              <AppIcon icon="FileCheck" size={14} color="#F59E0B" />
              <AppText variant="caption" color="muted" style={styles.statLabel}>
                {t("vehicles.card.inspectionExpire")}
              </AppText>
            </View>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {vehicle.inspectionExpireDate || "-"}
            </AppText>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statLabelRow}>
              <AppIcon icon="Shield" size={14} color="#8B5CF6" />
              <AppText variant="caption" color="muted" style={styles.statLabel}>
                {t("vehicles.card.insuranceExpire")}
              </AppText>
            </View>
            <AppText variant="bodyLarge" style={styles.statValue}>
              {vehicle.insuranceExpireDate || "-"}
            </AppText>
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
  deleteButton: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
});
