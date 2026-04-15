import { Tabs } from "expo-router";
import { Settings } from "lucide-react-native";
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: "Settings",
          tabBarIcon: () => <Settings size={24} />,
        }}
      />
    </Tabs>
  );
}
