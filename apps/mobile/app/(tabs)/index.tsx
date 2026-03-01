import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { useTheme } from "@/theme/theme-context";
import { useStore } from "@/stores";
import { spacing } from "@/theme/tokens/spacing";

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.auth.user);
  const logout = useStore((state) => state.auth.logout);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppText variant="heading2">Welcome, {user?.fullName}</AppText>
      <AppText variant="bodyMedium" color="muted" style={styles.email}>
        {user?.email}
      </AppText>
      <AppButton
        variant="primary"
        onPress={() => router.push("/design-system" as const)}
        style={styles.button}
      >
        Design System
      </AppButton>
      <AppButton variant="secondary" onPress={logout} style={styles.button}>
        Logout
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  email: {
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.lg,
    width: "100%",
  },
});
