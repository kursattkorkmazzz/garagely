import { useEffect, useState } from "react";
import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { sdk } from "@/stores/sdk";
import { AppText } from "@/components/ui/app-text";
import { spacing } from "@/theme/tokens/spacing";
import { AppIcon, type IconName } from "@/components/ui/app-icon";
import { ListItem } from "@/components/common/list-item";
import { AppView } from "@/components/ui/app-view";
import { useFormikContext } from "formik";
import { AddVehicleFormState } from "../../add-vehicle-wizard";
import type {
  VehicleFuelTypeModel,
  VehicleTransmissionTypeModel,
  VehicleBodyTypeModel,
} from "@garagely/shared/models/vehicle";

export function SpecsStep() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext<AddVehicleFormState>();

  // Local state for lookups
  const [fuelTypes, setFuelTypes] = useState<VehicleFuelTypeModel[]>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<
    VehicleTransmissionTypeModel[]
  >([]);
  const [bodyTypes, setBodyTypes] = useState<VehicleBodyTypeModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch lookups on mount
  useEffect(() => {
    async function fetchLookups() {
      setIsLoading(true);
      await Promise.all([
        sdk.vehicle.getFuelTypes({
          onSuccess: (data) => {
            console.log(data);

            setFuelTypes(data.data);
          },
          onError: () => {},
        }),
        sdk.vehicle.getTransmissionTypes({
          onSuccess: (data) => {
            console.log(data);

            setTransmissionTypes(data.data);
          },
          onError: () => {},
        }),
        sdk.vehicle.getBodyTypes({
          onSuccess: (data) => {
            console.log(data);
            setBodyTypes(data.data);
          },
          onError: () => {},
        }),
      ]);
      setIsLoading(false);
    }
    fetchLookups();
  }, []);

  if (isLoading) {
    return (
      <AppView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </AppView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Fuel Type */}
      <AppView style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.fuelType")}
        </AppText>

        <AppView style={styles.listContainer}>
          {fuelTypes
            .filter((ft) => ft.isActive)
            .map((fuelType) => (
              <ListItem
                key={fuelType.id}
                item={{
                  id: fuelType.id,
                  name: t(`fuel_types:${fuelType.type}`),
                }}
                isSelected={formik.values.fuelTypeId === fuelType.id}
                onClick={() => {
                  formik.setFieldValue("fuelTypeId", fuelType.id);
                }}
                RightAction={
                  <AppIcon
                    icon={(fuelType.icon as IconName) || "Fuel"}
                    color={theme.mutedForeground}
                  />
                }
              />
            ))}
          {formik.touched.fuelTypeId && formik.errors.fuelTypeId && (
            <AppText variant="bodySmall" color="destructive">
              {formik.errors.fuelTypeId}
            </AppText>
          )}
        </AppView>
      </AppView>

      {/* Transmission Type */}
      <AppView style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.transmissionType")}
        </AppText>

        <AppView style={styles.listContainer}>
          {transmissionTypes
            .filter((tt) => tt.isActive)
            .map((transmissionType) => (
              <ListItem
                key={transmissionType.id}
                item={{
                  id: transmissionType.id,
                  name: t(`transmissionTypes.${transmissionType.type}`, {
                    ns: "vehicles",
                  }),
                }}
                isSelected={
                  formik.values.transmissionTypeId === transmissionType.id
                }
                onClick={() => {
                  formik.setFieldValue(
                    "transmissionTypeId",
                    transmissionType.id,
                  );
                }}
                RightAction={
                  <AppIcon
                    icon={transmissionType.icon as IconName}
                    color={theme.mutedForeground}
                  />
                }
              />
            ))}
          {formik.touched.transmissionTypeId &&
            formik.errors.transmissionTypeId && (
              <AppText variant="bodySmall" color="destructive">
                {formik.errors.transmissionTypeId}
              </AppText>
            )}
        </AppView>
      </AppView>

      {/* Body Type */}
      <AppView style={styles.section}>
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {t("addVehicle.bodyType")}
        </AppText>

        <AppView style={styles.listContainer}>
          {bodyTypes
            .filter((bt) => bt.isActive)
            .map((bodyType) => (
              <ListItem
                key={bodyType.id}
                item={{
                  id: bodyType.id,
                  name: t(`bodyTypes.${bodyType.type}`, { ns: "vehicles" }),
                }}
                isSelected={formik.values.bodyTypeId === bodyType.id}
                onClick={() => {
                  formik.setFieldValue("bodyTypeId", bodyType.id);
                }}
                RightAction={
                  <AppIcon
                    icon={bodyType.icon as IconName}
                    color={theme.mutedForeground}
                  />
                }
              />
            ))}
          {formik.touched.bodyTypeId && formik.errors.bodyTypeId && (
            <AppText variant="bodySmall" color="destructive">
              {formik.errors.bodyTypeId}
            </AppText>
          )}
        </AppView>
      </AppView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
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
  section: {
    gap: spacing.sm,
  },
});
