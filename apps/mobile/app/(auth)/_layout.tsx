import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useStore } from "@/stores";
import { useTheme } from "@/theme/theme-context";

export default function AuthLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  // Redirect authenticated users to tabs
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
