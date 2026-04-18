import { IconName } from "@/components/ui/icon";
import { TabIcon } from "@/layouts/tabs/tab-icon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useUnistyles } from "react-native-unistyles";

type TabOptionsProps = {
  title: string;
  icon: IconName;
};
export function TabOptions(props: TabOptionsProps): BottomTabNavigationOptions {
  const { theme } = useUnistyles();

  return {
    headerShown: false,
    title: props.title,
    tabBarIcon: TabIcon({ name: props.icon }),
    tabBarStyle: {
      backgroundColor: theme.colors.background,
      borderTopWidth: 0,

      // Android
      elevation: 0,

      // iOS
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
    },
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.muted,
  };
}
