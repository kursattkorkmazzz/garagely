import { TabOptions } from "@/layouts/tabs/tab-options";
import { Tabs } from "expo-router";
export default function TabLayout() {
  return (
    <Tabs>
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
