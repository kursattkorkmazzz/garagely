import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { spacing } from "@/theme/tokens/spacing";
import { AppIcon, type IconName } from "@/components/ui/app-icon";
import { ListItem } from "@/components/common/list-item";
import { AppView } from "@/components/ui/app-view";
import { useFormikContext } from "formik";
import { AddVehicleFormState } from "../../add-vehicle-wizard";

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

const MOCK_FUEL_TYPES = [
  {
    id: "1",
    type: "petrol",
    icon: "Fuel",
    isActive: true,
  },
  {
    id: "2",
    type: "diesel",
    icon: "Fuel",
    isActive: true,
  },
  {
    id: "3",
    type: "electric",
    icon: "Zap",
    isActive: true,
  },
  {
    id: "4",
    type: "hybrid",
    icon: "Leaf",
    isActive: true,
  },
  {
    id: "5",
    type: "lpg",
    icon: "Flame",
    isActive: true,
  },
];

export function SpecsStep() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext<AddVehicleFormState>();

  const [fuelTypes, _] = useState(MOCK_FUEL_TYPES);

  return (
    <ScrollView style={styles.container}>
      {/* Fuel Type */}
      <View style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.fuelType")}
        </AppText>

        <AppView
          style={{
            flexDirection: "column",
            flex: 1,
            gap: spacing.sm,
          }}
        >
          {fuelTypes.map((fuelType) => (
            <ListItem
              key={fuelType.id}
              item={{
                id: fuelType.id,
                name: t(`${fuelType.type}`, {
                  ns: "fuelTypes",
                }),
              }}
              isSelected={
                formik.values.fuelTypeId
                  ? formik.values.fuelTypeId === fuelType.id
                  : false
              }
              onClick={(item) => {
                formik.setFieldValue("fuelTypeId", item.id);
              }}
              RightAction={<AppIcon icon={fuelType.icon as any} />}
            />
          ))}
          <AppText variant="bodySmall" color="destructive">
            {formik.errors.fuelTypeId}
          </AppText>
        </AppView>
      </View>

      {/* Transmission Type */}
      <View style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.transmissionType")}
        </AppText>
        {/* Transmission Type Card */}
      </View>

      {/* Body Type */}
      <View style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.bodyType")}
        </AppText>
        {/* Body Type Card */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
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
