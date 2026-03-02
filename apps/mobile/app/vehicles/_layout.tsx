import { Stack } from "expo-router";
import { useTheme } from "@/theme/theme-context";

export default function VehiclesLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
