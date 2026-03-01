import { Redirect } from "expo-router";
import { useStore } from "@/stores";

export default function Index() {
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}
