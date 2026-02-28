import { ThemeProvider, useTheme } from "@/theme/theme-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function RootLayoutContent() {
  const { theme, themeName } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={themeName === "dark" ? "light" : "dark"} animated />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
