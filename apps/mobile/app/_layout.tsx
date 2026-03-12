import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@/theme/theme-context";
import { I18nProvider } from "@/context/i18n-context";
import { AppToastProvider } from "@/components/ui/app-toast";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "@/stores";
import {
  getCachedPreferences,
  type CachedPreferences,
} from "@/utils/preferences-cache";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { theme, themeName } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <AppToastProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
            }}
          />
          <StatusBar style={themeName === "dark" ? "light" : "dark"} animated />
        </AppToastProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const { isInitialized, restoreSession } = useStore((state) => state.auth);
  const user = useStore((state) => state.user.user);
  const [cachedPrefs, setCachedPrefs] = useState<CachedPreferences | null>(null);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // Load cached preferences first
  useEffect(() => {
    getCachedPreferences().then((prefs) => {
      setCachedPrefs(prefs);
      setIsCacheLoaded(true);
    });
  }, []);

  // Restore session after cache is loaded
  useEffect(() => {
    if (isCacheLoaded) {
      const { cancel } = restoreSession();
      return () => cancel();
    }
  }, [isCacheLoaded]);

  // Hide splash when initialized
  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hide();
    }
  }, [isInitialized]);

  // Don't render until cache is loaded and session is restored
  if (!isCacheLoaded || !isInitialized) {
    return null;
  }

  // Use user preferences if authenticated, otherwise use cached
  const theme = user?.preferences?.theme ?? cachedPrefs?.theme;
  const locale = user?.preferences?.locale ?? cachedPrefs?.locale;

  return (
    <I18nProvider initialLocale={locale}>
      <ThemeProvider initialTheme={theme}>
        <RootLayoutInner />
      </ThemeProvider>
    </I18nProvider>
  );
}
