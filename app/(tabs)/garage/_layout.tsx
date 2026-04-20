import { AppHeader } from "@/layouts/header/app-header";
import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="vehicle/index"
        options={{
          headerShown: true,
          header: (props) => <AppHeader title={"Vehicles"} />,
        }}
      />
    </Stack>
  );
}
