import { AppButton } from "@/components/ui/app-button";
import Icon from "@/components/ui/icon";
import { StationDetailScreen } from "@/features/station/screens/station-detail/StationDetailScreen";
import { useI18n } from "@/i18n";
import { AppHeader } from "@/layouts/header/app-header";
import { useStationStore } from "@/stores/station.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function StationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n("station");
  const { theme } = useUnistyles();
  const station = useStationStore((s) => s.stations.find((x) => x.id === id));
  const deleteStation = useStationStore((s) => s.delete);

  const handleEdit = () =>
    router.push({
      pathname: "/garage/station/[id]/station-form",
      params: { id },
    });

  const handleDelete = () => {
    Alert.alert(t("deleteConfirmTitle"), t("deleteConfirmMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          deleteStation(id)
            .then(() => router.back())
            .catch(handleUIError);
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader
              title={station?.name ?? ""}
              goBack
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
      <StationDetailScreen id={id} />
    </>
  );
}

const styles = StyleSheet.create(() => ({
  headerActions: {
    flexDirection: "row",
  },
}));
