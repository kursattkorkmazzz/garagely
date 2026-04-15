import { IconName } from "@/components/ui/icon";
import { TabIcon } from "@/layouts/tabs/tab-icon";
import { useTheme } from "@/theme/hooks/use-theme";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

type TabOptionsProps = {
  title: string;
  icon: IconName;
};
export function TabOptions(props: TabOptionsProps): BottomTabNavigationOptions {
  const { theme } = useTheme();

  return {
    headerShown: false,
    title: props.title,
    tabBarIcon: TabIcon({ name: props.icon }),
    tabBarStyle: {
      backgroundColor: theme.background,
      borderTopWidth: 0,

      // Android
      elevation: 0,

      // iOS
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
    },
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: theme.muted,
  };
}
