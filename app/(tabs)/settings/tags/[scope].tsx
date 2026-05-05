import { TagScopeScreen } from "@/features/tag/screens/TagScopeScreen";
import { useLocalSearchParams } from "expo-router";

export default function TagScopeRoute() {
  const { scope } = useLocalSearchParams<{ scope: string }>();
  return <TagScopeScreen scope={scope} />;
}
