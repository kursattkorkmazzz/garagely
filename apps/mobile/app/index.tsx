import { Redirect } from "expo-router";
import { useStore } from "@/stores";

export default function Index() {
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  console.log(isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/design-system" />;
  }

  return <Redirect href="/(auth)" />;
}
