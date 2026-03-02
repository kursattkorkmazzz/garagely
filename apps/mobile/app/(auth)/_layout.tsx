import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useStore } from "@/stores";
import { useTheme } from "@/theme/theme-context";

export default function AuthLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, isInitialized, restoreSession } = useStore(
    (state) => state.auth,
  );

  // Restore session on mount
  useEffect(() => {
    if (!isInitialized) {
      restoreSession();
    }
  }, [isInitialized, restoreSession]);

  // Redirect authenticated users to tabs
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
