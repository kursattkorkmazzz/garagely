import { AppHeader } from "@/layouts/header/app-header";
import { VehicleFormScreen } from "@/features/vehicle/screens/vehicle-form/VehicleFormScreen";
import { Stack, useLocalSearchParams } from "expo-router";
import { useI18n } from "@/i18n";

export default function VehicleFormRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n("vehicle");
  const isNew = id === "new";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader
              title={isNew ? t("addVehicle") : t("editVehicle")}
              icon="Car"
              goBack={true}
              {...props}
            />
          ),
        }}
      />
      <VehicleFormScreen id={id} />
    </>
  );
}
