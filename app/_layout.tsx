import { DatabaseProvider } from "@/db/hooks/database-provider";
import { LocalizationProvider } from "@/i18n";
import { AppThemeTypes } from "@/shared/theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUnistyles } from "react-native-unistyles";
import "reflect-metadata";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme, rt } = useUnistyles();

  return (
    <DatabaseProvider>
      <LocalizationProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
          <>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="index" />
            </Stack>
            <StatusBar
              barStyle={
                rt.themeName === AppThemeTypes.LIGHT
                  ? "dark-content"
                  : "light-content"
              }
            />
          </>
        </SafeAreaView>
      </LocalizationProvider>
    </DatabaseProvider>
  );
}
