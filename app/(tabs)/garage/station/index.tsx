import { AppButton } from "@/components/ui/app-button";
import Icon from "@/components/ui/icon";
import { StationListScreen } from "@/features/station/screens/station-list/StationListScreen";
import { useAppHeader } from "@/layouts/header/hooks/use-app-header";
import { router } from "expo-router";
import { useEffect } from "react";
import { useUnistyles } from "react-native-unistyles";

export default function StationListRoute() {
  const appHeader = useAppHeader();
  const { theme } = useUnistyles();

  useEffect(() => {
    appHeader.setHeaderRight(
      <AppButton
        variant="icon"
        onPress={() =>
          router.push({
            pathname: "/garage/station/[id]/station-form",
            params: { id: "new" },
          })
        }
      >
        <Icon name="Plus" size={20} color={theme.colors.primary} />
      </AppButton>,
    );
    return () => appHeader.resetHeaderRight();
  }, []);

  return <StationListScreen />;
}
