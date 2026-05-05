import { StationFormScreen } from "@/features/station/screens/station-form/StationFormScreen";
import { useLocalSearchParams } from "expo-router";

export default function StationFormRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StationFormScreen id={id} />;
}
