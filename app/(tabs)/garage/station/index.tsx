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

  const resetFilters = useStationStore((s) => s.resetFilters);
  const setFilters = useStationStore((s) => s.setFilters);

  // Route -> store sync. Entering a type-scoped list resets all filters and
  // applies just `type` so users get a clean slate per entry point.
  // setFilters triggers load(); the loadToken in the store ensures the
  // resetFilters() load is superseded so we don't fire two queries.
  useEffect(() => {
    resetFilters();
    if (type) setFilters({ type });
  }, [type, resetFilters, setFilters]);

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
