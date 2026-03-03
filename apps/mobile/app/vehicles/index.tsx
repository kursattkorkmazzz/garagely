import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { VehicleCard, VehicleCardData } from "@/components/garage";
import { spacing } from "@/theme/tokens/spacing";

// TODO: Replace with actual data from store
const mockVehicles: VehicleCardData[] = [
  {
    id: "1",
    name: "BMW X5",
    licensePlate: "ABC-1234",
    modelYear: 2021,
    mileage: 45200,
    costPerKm: 0.42,
    lastServiceDate: "Oct 12, 2023",
    isOverdue: false,
    coverImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    color: "#4A5568",
  },
  {
    id: "2",
    name: "Tesla Model 3",
    licensePlate: "ELC-9988",
    modelYear: 2022,
    mileage: 28500,
    costPerKm: 0.18,
    lastServiceDate: "Jan 15, 2023",
    isOverdue: true,
    color: "#1E3A5F",
  },
];

export default function VehicleListScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleAddPress = () => {
    router.push("/vehicles/add");
  };

  const handleVehiclePress = (vehicle: VehicleCardData) => {
    // TODO: Navigate to vehicle details
  };

  const handleCameraPress = (vehicle: VehicleCardData) => {
    // TODO: Open camera/gallery to update vehicle cover
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <AppIcon icon="ArrowLeft" size={24} color={theme.foreground} />
          </Pressable>
          <View>
            <AppText variant="heading2">{t("vehicles.title")}</AppText>
            <AppText variant="caption" color="muted">
              {t("vehicles.total", { count: mockVehicles.length })}
            </AppText>
          </View>
        </View>
        <AppButton variant="primary" size="sm" onPress={handleAddPress}>
          <View style={styles.addButtonContent}>
            <AppIcon icon="Plus" size={18} color={theme.primaryForeground} />
            <AppText style={{ color: theme.primaryForeground, fontWeight: "600" }}>
              {t("vehicles.add")}
            </AppText>
          </View>
        </AppButton>
      </View>

      {/* Vehicle List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onPress={() => handleVehiclePress(vehicle)}
            onCameraPress={() => handleCameraPress(vehicle)}
          />
        ))}
      </ScrollView>
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
  backButton: {
    padding: spacing.xs,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
