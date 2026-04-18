import "@/theme/unistyles";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
export default function GaragelyApp() {
  useEffect(() => {
    // If this component is mounted, it means the app is ready, so we can hide the splash screen
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
