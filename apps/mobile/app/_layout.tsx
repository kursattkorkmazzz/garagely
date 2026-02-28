import { ThemeProvider, useTheme } from "@/theme/theme-context";
import { AppToastProvider } from "@/components/ui/app-toast";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function RootLayoutContent() {
  const { theme, themeName } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <AppToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style={themeName === "dark" ? "light" : "dark"} animated />
        </AppToastProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
