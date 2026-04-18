import { TabOptions } from "@/layouts/tabs/tab-options";
import { Tabs } from "expo-router";
import { useUnistyles } from "react-native-unistyles";
export default function TabLayout() {
  const { theme } = useUnistyles();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: theme.colors.background,
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
