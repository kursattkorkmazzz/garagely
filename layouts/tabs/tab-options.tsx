import { IconName } from "@/components/ui/icon";
import { TabIcon } from "@/layouts/tabs/tab-icon";
import { AppTheme } from "@/theme/theme";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

type Theme = (typeof AppTheme)[keyof typeof AppTheme];

type TabOptionsProps = {
  title: string;
  icon: IconName;
  theme: Theme;
};
export function TabOptions(props: TabOptionsProps): BottomTabNavigationOptions {
  const { theme, title, icon } = props;

  return {
    headerShown: false,
    title,
    tabBarIcon: TabIcon({ name: icon }),
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
