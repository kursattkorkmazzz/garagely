import { View, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppBadge } from "@/components/ui/app-badge";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

type VehicleDetailHeroProps = {
  coverImage?: string;
  color?: string;
  vehicleName: string;
  licensePlate: string;
  isSelected: boolean;
};

export function VehicleDetailHero({
  coverImage,
  color,
  vehicleName,
  licensePlate,
  isSelected,
}: VehicleDetailHeroProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();

  const defaultColor = "#3B82F6";
  const vehicleColor = color || defaultColor;

  const content = (
    <>
      {/* ACTIVE Badge */}
      {isSelected && (
        <AppBadge
          variant="default"
          style={[styles.activeBadge, { backgroundColor: theme.primary }]}
        >
          <AppText
            variant="caption"
            style={{ color: theme.primaryForeground, fontWeight: "600" }}
          >
            {t("vehicleDetail.status.active")}
          </AppText>
        </AppBadge>
      )}

      {/* Vehicle name and plate */}
      <View style={styles.infoContainer}>
        <AppText variant="heading1" style={styles.vehicleName}>
          {vehicleName}
        </AppText>
        <AppBadge
          variant="secondary"
          style={[styles.plateBadge, { backgroundColor: theme.primary }]}
        >
          <AppText
            variant="caption"
            style={{ color: theme.primaryForeground, fontWeight: "500" }}
          >
            {licensePlate}
          </AppText>
        </AppBadge>
      </View>
    </>
  );

  if (coverImage) {
    return (
      <ImageBackground
        source={{ uri: coverImage }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={["transparent", withOpacity("#000000", 0.7)]}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </ImageBackground>
    );
  }

  // Gradient background when no cover image
  return (
    <LinearGradient
      colors={["#000000", vehicleColor, "#000000"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 240,
    justifyContent: "flex-end",
    padding: spacing.lg,
    borderRadius: radius * 2,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  heroImage: {
    borderRadius: radius * 2,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
    margin: -spacing.lg,
  },
  activeBadge: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoContainer: {
    flexDirection: "column",
    gap: spacing.sm,
  },
  vehicleName: {
    color: "#FFFFFF",
    alignSelf: "flex-start",
  },
  plateBadge: {
    alignSelf: "flex-start",
  },
});
