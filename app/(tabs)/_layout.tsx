import { TabOptions } from "@/layouts/tabs/tab-options";
import { useTheme } from "@/theme/hooks/use-theme";
import { Tabs } from "expo-router";
export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={TabOptions({
          icon: "Settings",
          title: "Settings",
        })}
      />
    </Tabs>
  );
}
