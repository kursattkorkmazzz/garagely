import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import {
  AppAvatar,
  AppAvatarImage,
  AppAvatarFallback,
} from "@/components/ui/app-avatar";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

type AppHeaderProps = {
  showVehicleSelector?: boolean;
  showNotificationButton?: boolean;
  showSearchButton?: boolean;
  title?: string;
};

export function AppHeader({
  showVehicleSelector = true,
  showNotificationButton = true,
  showSearchButton = true,
  title,
}: AppHeaderProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const user = useStore((state) => state.auth.user);
  const avatar = useStore((state) => state.user.avatar);

  // TODO: Replace with actual vehicle data from store
  const selectedVehicle = "Luxury Sedan";

  const handleAvatarPress = () => {
    router.push("/(tabs)/profile");
  };

  const handleVehicleSelectorPress = () => {
    router.push("/vehicles");
  };

  return (
    <View style={styles.headerContainer}>
      {/* Top Row: Avatar, Vehicle Selector, Notification */}
      <View style={styles.topRow}>
        <AppButton variant="ghost" size="icon" onPress={handleAvatarPress}>
          <AppAvatar size="sm">
            <AppAvatarImage src={avatar?.url ?? ""} alt={user?.fullName} />
            <AppAvatarFallback fallbackText={user?.fullName} />
          </AppAvatar>
        </AppButton>

        {showVehicleSelector && (
          <AppButton
            variant="ghost"
            style={styles.vehicleSelector}
            onPress={handleVehicleSelectorPress}
          >
            <AppText variant="bodyMedium" style={{ fontWeight: "600" }}>
              {selectedVehicle}
            </AppText>
            <AppIcon icon="ChevronDown" size={18} color={theme.foreground} />
          </AppButton>
        )}

        {showNotificationButton && (
          <AppButton
            variant="ghost"
            size="icon"
            style={[
              styles.iconButton,
              { backgroundColor: withOpacity(theme.muted, 0.1) },
            ]}
          >
            <AppIcon icon="Bell" size={20} color={theme.foreground} />
            {/* Notification dot */}
            <View
              style={[
                styles.notificationDot,
                { backgroundColor: theme.destructive },
              ]}
            />
          </AppButton>
        )}
      </View>

      {/* Title Row */}
      {title && (
        <View style={styles.titleRow}>
          <AppText variant="heading1">{title}</AppText>
          {showSearchButton && (
            <AppButton
              variant="ghost"
              size="icon"
              style={[
                styles.iconButton,
                { backgroundColor: withOpacity(theme.muted, 0.1) },
              ]}
            >
              <AppIcon icon="Search" size={20} color={theme.foreground} />
            </AppButton>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  vehicleSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius * 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
