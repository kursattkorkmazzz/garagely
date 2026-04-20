import Icon, { IconName } from "@/components/ui/icon";
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
    tabBarIcon: ({ color }) => <Icon name={icon} size={24} color={color} />,
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
