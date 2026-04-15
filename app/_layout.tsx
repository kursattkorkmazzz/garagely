import GaragelyApp from "@/app";
import { LocalizationProvider } from "@/i18n";
import { ThemeProvider } from "@/theme/provider/theme-provider";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

//TODO: Add fade in animation to splash screen at production
/* SplashScreen.setOptions({
  fade: true,
  duration: 1000,
}); */
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <GaragelyApp />
        </SafeAreaView>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
