import { useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { sdk } from "@/stores/sdk";
import { showApiError } from "@/utils/show-api-error";
import { EditVehicleWizard } from "@/components/vehicle/vehicle-wizard";
import type { DetailedVehicleModel } from "@garagely/shared/models/vehicle";

export default function EditVehicleScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [vehicle, setVehicle] = useState<DetailedVehicleModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicle = useCallback(() => {
    if (!id) return;
    setIsLoading(true);
    sdk.vehicle.getDetailedVehicleById(id, {
      onSuccess: (response) => {
        setVehicle(response.data);
        setIsLoading(false);
      },
      onError: (error) => {
        showApiError(error);
        setIsLoading(false);
      },
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchVehicle();
    }, [fetchVehicle]),
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <AppText color="muted">{t("errors.generic")}</AppText>
      </View>
    );
  }

  return <EditVehicleWizard vehicle={vehicle} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
