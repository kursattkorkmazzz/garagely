import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useStore } from "@/stores";
import { useTheme } from "@/theme/theme-context";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isInitialized, restoreSession } = useStore(
    (state) => state.auth,
  );

  // Restore session on mount
  useEffect(() => {
    if (!isInitialized) {
      restoreSession();
    }
  }, [isInitialized, restoreSession]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
