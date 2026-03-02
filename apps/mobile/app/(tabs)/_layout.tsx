import { Tabs } from "expo-router";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/theme/theme-context";
import { AuthGuard } from "@/components/auth-guard";
import { useI18n } from "@/hooks/use-i18n";

export default function TabsLayout() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const bottomBar = theme.bottomBar;

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: theme.background,
          },
          tabBarStyle: {
            backgroundColor: bottomBar.backgrund,
            borderTopColor: bottomBar.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: bottomBar.primary,
          tabBarInactiveTintColor: bottomBar.foreground,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.dashboard"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="LayoutDashboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="garage"
          options={{
            title: t("tabs.garage"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="Car" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: t("tabs.alerts"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="Bell" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="User" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="design-system"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
