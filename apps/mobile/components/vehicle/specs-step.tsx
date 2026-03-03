import { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores/root.store";
import { AppText } from "@/components/ui/app-text";
import { AppChipSelector } from "@/components/ui/app-chip-selector";
import { spacing } from "@/theme/tokens/spacing";
import type { IconName } from "@/components/ui/app-icon";

type SpecsStepProps = {
  selectedFuelTypeId: string | null;
  selectedTransmissionTypeId: string | null;
  selectedBodyTypeId: string | null;
  onFuelTypeSelect: (id: string) => void;
  onTransmissionTypeSelect: (id: string) => void;
  onBodyTypeSelect: (id: string) => void;
};

// Map fuel types to icons
const fuelTypeIcons: Record<string, IconName> = {
  petrol: "Fuel",
  diesel: "Fuel",
  electric: "Zap",
  hybrid: "Leaf",
  lpg: "Flame",
};

// Map transmission types to icons
const transmissionTypeIcons: Record<string, IconName> = {
  manual: "Settings",
  automatic: "Settings2",
  cvt: "CircleDot",
};

// Map body types to icons
const bodyTypeIcons: Record<string, IconName> = {
  sedan: "Car",
  suv: "Truck",
  hatchback: "CarFront",
  coupe: "Car",
  convertible: "Wind",
  wagon: "CarTaxiFront",
  van: "Bus",
  pickup: "Truck",
  minivan: "Bus",
};

export function SpecsStep({
  selectedFuelTypeId,
  selectedTransmissionTypeId,
  selectedBodyTypeId,
  onFuelTypeSelect,
  onTransmissionTypeSelect,
  onBodyTypeSelect,
}: SpecsStepProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const {
    fuelTypes,
    transmissionTypes,
    bodyTypes,
    isLoadingLookups,
    fetchFuelTypes,
    fetchTransmissionTypes,
    fetchBodyTypes,
  } = useStore((state) => state.vehicle);

  useEffect(() => {
    if (fuelTypes.length === 0) {
      fetchFuelTypes();
    }
    if (transmissionTypes.length === 0) {
      fetchTransmissionTypes();
    }
    if (bodyTypes.length === 0) {
      fetchBodyTypes();
    }
  }, [
    fuelTypes.length,
    transmissionTypes.length,
    bodyTypes.length,
    fetchFuelTypes,
    fetchTransmissionTypes,
    fetchBodyTypes,
  ]);

  const fuelTypeOptions = fuelTypes.map((ft) => ({
    value: ft.id,
    label: ft.type,
    icon: fuelTypeIcons[ft.type.toLowerCase()] || ("Fuel" as IconName),
  }));

  const transmissionOptions = transmissionTypes.map((tt) => ({
    value: tt.id,
    label: tt.type,
    icon: transmissionTypeIcons[tt.type.toLowerCase()] || ("Settings" as IconName),
  }));

  const bodyTypeOptions = bodyTypes.map((bt) => ({
    value: bt.id,
    label: bt.type,
    icon: bodyTypeIcons[bt.type.toLowerCase()] || ("Car" as IconName),
  }));

  if (isLoadingLookups && fuelTypes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fuel Type */}
      <View style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.fuelType")}
        </AppText>
        <AppChipSelector
          options={fuelTypeOptions}
          value={selectedFuelTypeId || undefined}
          onValueChange={onFuelTypeSelect}
        />
      </View>

      {/* Transmission Type */}
      <View style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.transmissionType")}
        </AppText>
        <AppChipSelector
          options={transmissionOptions}
          value={selectedTransmissionTypeId || undefined}
          onValueChange={onTransmissionTypeSelect}
        />
      </View>

      {/* Body Type */}
      <View style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.bodyType")}
        </AppText>
        <AppChipSelector
          options={bodyTypeOptions}
          value={selectedBodyTypeId || undefined}
          onValueChange={onBodyTypeSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
  },
});
