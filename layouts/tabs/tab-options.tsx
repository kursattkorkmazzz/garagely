import { IconName } from "@/components/ui/icon";
import { TabIcon } from "@/layouts/tabs/tab-icon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

type TabOptionsProps = {
  title: string;
  icon: IconName;
};
export function TabOptions(props: TabOptionsProps): BottomTabNavigationOptions {
  console.log("var(--color-secondary)");

  return {
    headerShown: false,
    title: props.title,
    tabBarIcon: TabIcon({ name: props.icon }),
    tabBarActiveTintColor: "var(--color-secondary)",
    tabBarInactiveTintColor: "var(--color-gray-500)",
  };
}
