import { BackgroundedIcon } from "@/components/list/backgrounded-icon";
import { AppText } from "@/components/ui/app-text";
import { Vehicle } from "@/features/vehicle/entity/vehicle.entity";
import { ChevronRight } from "lucide-react-native/icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type VehicleListItemProps = {
  vehicle: Vehicle;
  onPress: (id: string) => void;
};

export function VehicleListItem({ vehicle, onPress }: VehicleListItemProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      style={(state) => [
        styles.container,
        state.pressed && { backgroundColor: theme.colors.secondary },
      ]}
      onPress={() => onPress(vehicle.id)}
    >
      <View style={styles.left}>
        <BackgroundedIcon icon="Car" iconColor={theme.colors.primary} />
        <View style={styles.labelStack}>
          <AppText style={styles.brand}>{vehicle.brand}</AppText>
          <AppText style={styles.sub}>
            {vehicle.model} · {vehicle.year}
          </AppText>
        </View>
      </View>
      <ChevronRight color={theme.colors.muted} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    minHeight: 52,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md - 2,
  },
  labelStack: {
    flex: 1,
  },
  brand: {
    ...theme.typography.rowLabel,
    color: theme.colors.foreground,
  },
  sub: {
    ...theme.typography.rowSub,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
}));
