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

const MOCK_TRANSMISSIN_TYPES = [
  {
    id: "1",
    type: "manual",
    icon: "Settings",
    isActive: true,
  },
  {
    id: "2",
    type: "automatic",
    icon: "Settings2",
    isActive: true,
  },
  {
    id: "3",
    type: "cvt",
    icon: "CircleDot",
    isActive: true,
  },
];

const MOCK_BODY_TYPES = [
  {
    id: "1",
    type: "sedan",
    icon: "Car",
    isActive: true,
  },
  {
    id: "2",
    type: "suv",
    icon: "Truck",
    isActive: true,
  },
  {
    id: "3",
    type: "hatchback",
    icon: "CarFront",
    isActive: true,
  },
  {
    id: "4",
    type: "coupe",
    icon: "Car",
    isActive: true,
  },
  {
    id: "5",
    type: "convertible",
    icon: "Wind",
    isActive: true,
  },
  {
    id: "6",
    type: "wagon",
    icon: "CarTaxiFront",
    isActive: true,
  },
  {
    id: "7",
    type: "van",
    icon: "Bus",
    isActive: true,
  },
  {
    id: "8",
    type: "pickup",
    icon: "Truck",
    isActive: true,
  },
  {
    id: "9",
    type: "minivan",
    icon: "Bus",
    isActive: true,
  },
];
export function SpecsStep() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext<AddVehicleFormState>();

  return (
    <ScrollView style={styles.container}>
      {/* Fuel Type */}
      <AppView style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.fuelType")}
        </AppText>

        {/* Fuel Type List */}
        <AppView style={styles.listContainer}>
          {MOCK_FUEL_TYPES.map((fuelType) => (
            <ListItem
              key={fuelType.id}
              item={{
                id: fuelType.id,
                name: t(`fuel_types:${fuelType.type}`),
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
      </AppView>

      {/* Transmision Type */}
      <AppView style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.transmissionType")}
        </AppText>

        {/* Tranmission Type List */}
        <AppView style={styles.listContainer}>
          {MOCK_TRANSMISSIN_TYPES.map((transmissionType) => (
            <ListItem
              key={transmissionType.id}
              item={{
                id: transmissionType.id,
                name: t(`transmissionTypes.${transmissionType.type}`, {
                  ns: "vehicles",
                }),
              }}
              isSelected={
                formik.values.transmissionTypeId
                  ? formik.values.transmissionTypeId === transmissionType.id
                  : false
              }
              onClick={(item) => {
                formik.setFieldValue("transmissionTypeId", transmissionType.id);
              }}
              RightAction={<AppIcon icon={transmissionType.icon as any} />}
            />
          ))}
          <AppText variant="bodySmall" color="destructive">
            {formik.errors.transmissionTypeId}
          </AppText>
        </AppView>
      </AppView>

      {/* Body Type */}
      <AppView style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.bodyType")}
        </AppText>

        {/* Body Type List */}
        <AppView style={styles.listContainer}>
          {MOCK_BODY_TYPES.map((bodyTypes) => (
            <ListItem
              key={bodyTypes.id}
              item={{
                id: bodyTypes.id,
                name: t(`bodyTypes.${bodyTypes.type}`, {
                  ns: "vehicles",
                }),
              }}
              isSelected={
                formik.values.bodyTypeId
                  ? formik.values.bodyTypeId === bodyTypes.id
                  : false
              }
              onClick={(item) => {
                formik.setFieldValue("bodyTypeId", item.id);
              }}
              RightAction={<AppIcon icon={bodyTypes.icon as any} />}
            />
          ))}
          <AppText variant="bodySmall" color="destructive">
            {formik.errors.bodyTypeId}
          </AppText>
        </AppView>
      </AppView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
  },
  listContainer: {
    flexDirection: "column",
    flex: 1,
    gap: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
  },
});
