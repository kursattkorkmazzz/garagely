import { StationFormScreen } from "@/features/station/screens/station-form/StationFormScreen";
import {
  ALL_STATION_TYPES,
  StationType,
} from "@/features/station/types/station-type";
import { useLocalSearchParams } from "expo-router";

export default function StationFormRoute() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const initialType =
    type && (ALL_STATION_TYPES as string[]).includes(type)
      ? (type as StationType)
      : undefined;
  return <StationFormScreen id={id} initialType={initialType} />;
}
