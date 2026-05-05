import { AppHeader } from "@/layouts/header/app-header";
import { useI18n } from "@/i18n";
import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function SettingsLayout() {
  const { theme } = useUnistyles();
  const { t } = useI18n("tag");

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="tags/index"
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader
              title={t("management.title")}
              icon="Tag"
              goBack
              {...props}
            />
          ),
        }}
      />
      <Stack.Screen
        name="tags/[scope]"
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader title={t("management.title")} goBack {...props} />
          ),
        }}
      />
    </Stack>
  );
}
