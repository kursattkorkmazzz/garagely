import { AppButton } from "@/components/ui/app-button";
import Icon from "@/components/ui/icon";
import { StationListScreen } from "@/features/station/screens/station-list/StationListScreen";
import { ALL_STATION_TYPES, StationType } from "@/features/station/types/station-type";
import { useAppHeader } from "@/layouts/header/hooks/use-app-header";
import { useStationStore } from "@/stores/station.store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useUnistyles } from "react-native-unistyles";

export default function StationListRoute() {
  const appHeader = useAppHeader();
  const { theme } = useUnistyles();
  const { type: typeParamRaw } = useLocalSearchParams<{ type?: string }>();

  const type =
    typeParamRaw && (ALL_STATION_TYPES as string[]).includes(typeParamRaw)
      ? (typeParamRaw as StationType)
      : null;

  const setTypeFilter = useStationStore((s) => s.setTypeFilter);

  // Sync route -> store on mount / param change
  useEffect(() => {
    setTypeFilter(type);
  }, [type, setTypeFilter]);

  useEffect(() => {
    appHeader.setHeaderRight(
      <AppButton
        variant="icon"
        onPress={() =>
          router.push({
            pathname: "/garage/station/[id]/station-form",
            params: { id: "new", ...(type ? { type } : {}) },
          })
        }
      >
        <Icon name="Plus" size={20} color={theme.colors.primary} />
      </AppButton>,
    );
    return () => appHeader.resetHeaderRight();
  }, [type]);

  return <StationListScreen />;
}
