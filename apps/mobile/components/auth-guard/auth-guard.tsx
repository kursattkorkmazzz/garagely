import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useStore } from "@/stores";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}
