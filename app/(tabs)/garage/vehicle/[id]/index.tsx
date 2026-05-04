import { AppButton } from "@/components/ui/app-button";
import Icon from "@/components/ui/icon";
import { VehicleDetailScreen } from "@/features/vehicle/screens/vehicle-detail/VehicleDetailScreen";
import { useI18n } from "@/i18n";
import { AppHeader } from "@/layouts/header/app-header";
import { useVehicleStore } from "@/stores/vehicle.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function VehicleDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n("vehicle");
  const { theme } = useUnistyles();
  const vehicleBasic = useVehicleStore((s) =>
    s.vehicles.find((v) => v.id === id),
  );
  const deleteVehicle = useVehicleStore((s) => s.delete);

  const handleEdit = () => {
    router.push({
      pathname: "/garage/vehicle/[id]/vehicle-form",
      params: { id },
    });
  };

  const handleDelete = () => {
    const name = vehicleBasic
      ? `${vehicleBasic.brand} ${vehicleBasic.model}`
      : "";
    Alert.alert(
      t("detail.deleteConfirmTitle"),
      t("detail.deleteConfirmMessage", { name }),
      [
        { text: t("detail.deleteCancel"), style: "cancel" },
        {
          text: t("detail.deleteConfirm"),
          style: "destructive",
          onPress: () => {
            deleteVehicle(id)
              .then(() => router.back())
              .catch(handleUIError);
          },
        },
      ],
    );
  };

  const headerTitle = vehicleBasic
    ? `${vehicleBasic.brand} ${vehicleBasic.model}`
    : "";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader
              title={headerTitle}
              goBack={true}
              RightComponent={
                <View style={styles.headerActions}>
                  <AppButton variant="icon" onPress={handleEdit}>
                    <Icon name="Pencil" size={20} color={theme.colors.primary} />
                  </AppButton>
                  <AppButton variant="icon" onPress={handleDelete}>
                    <Icon
                      name="Trash2"
                      size={20}
                      color={theme.colors.destructive}
                    />
                  </AppButton>
                </View>
              }
              {...props}
            />
          ),
        }}
      />
      <VehicleDetailScreen id={id} />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  headerActions: {
    flexDirection: "row",
  },
}));
