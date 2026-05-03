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
        name="showcase/index"
        options={TabOptions({
          icon: "Sparkle",
          title: "Showcase",
          theme,
        })}
      />
      <Tabs.Screen
        name="garage"
        options={TabOptions({
          icon: "Warehouse",
          title: "Garage",
          theme,
        })}
      />
      <Tabs.Screen
        name="settings"
        options={TabOptions({
          icon: "Settings",
          title: "Settings",
          theme,
        })}
      />
    </Tabs>
  );
}
