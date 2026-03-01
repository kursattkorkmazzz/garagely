import { Tabs } from "expo-router";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/theme/theme-context";
import { AuthGuard } from "@/components/auth-guard";

export default function TabsLayout() {
  const { theme } = useTheme();
  const bottomBar = theme.bottomBar;

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
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
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="LayoutDashboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="garage"
          options={{
            title: "Garage",
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="Car" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: "Alerts",
            tabBarIcon: ({ color, size }) => (
              <AppIcon icon="Bell" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
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
