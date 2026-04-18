import { LocalizationProvider } from "@/i18n";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" />
        </Stack>
      </SafeAreaView>
    </LocalizationProvider>
  );
}
