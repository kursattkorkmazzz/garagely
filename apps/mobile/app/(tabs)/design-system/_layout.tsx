import { Pressable, StyleSheet, View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { spacing } from "@/theme/tokens/spacing";

function Header() {
  const { theme, themeName, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Get the current route name from pathname
  const routeName = pathname.split("/").pop() || "design-system";
  const title = routeName.charAt(0).toUpperCase() + routeName.slice(1);

  return (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <AppText variant="heading5">{title}</AppText>
      <Pressable onPress={toggleTheme} style={styles.toggleButton}>
        <AppIcon
          icon={themeName === "dark" ? "Sun" : "Moon"}
          size={22}
          color={theme.foreground}
        />
      </Pressable>
    </View>
  );
}

export default function DesignSystemLayout() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  toggleButton: {
    padding: spacing.sm,
  },
});
