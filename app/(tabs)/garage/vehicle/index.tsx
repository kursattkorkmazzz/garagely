import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { useAppHeader } from "@/layouts/header/hooks/use-app-header";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export default function VehicleList() {
  const appHeader = useAppHeader();

  useEffect(() => {
    appHeader.setHeaderRight(<VehicleListHeaderRightAction />);
    return () => {
      appHeader.resetHeaderRight();
    };
  }, []);

  return (
    <View>
      <AppText>Vehicle List</AppText>
    </View>
  );
}

function VehicleListHeaderRightAction() {
  const { theme } = useUnistyles();

  const createVehicleHandler = () => {
    console.log("Create Vehicle Form");
    router.push({
      pathname: "/garage/vehicle/[id]/vehicle-form",
      params: {
        id: "new",
      },
    });
  };

  return (
    <AppButton variant="icon" onPress={createVehicleHandler}>
      <Icon name="Plus" size={20} color={theme.colors.primary} />
    </AppButton>
  );
}
