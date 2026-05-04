import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import "@/components/sheets/sheets";
import "@/utils/dayjs";
import { AppToast } from "@/components/ui/app-toast/app-toast";
import { viewDB } from "@/db/db";
import { DatabaseProvider } from "@/db/hooks/database-provider";
import { LocalizationProvider } from "@/i18n";
import { AppThemeTypes } from "@/shared/theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "react-native";
import { SheetProvider } from "react-native-actions-sheet";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUnistyles } from "react-native-unistyles";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme, rt } = useUnistyles();

  useDrizzleStudio(viewDB);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SheetProvider>
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
              <AppToast />
            </>
          </SafeAreaView>
        </LocalizationProvider>
      </DatabaseProvider>
    </SheetProvider>
    </GestureHandlerRootView>
  );
}
