import { StyleSheet } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppView } from "@/components/ui/app-view";
import { useStore } from "@/stores";
import { spacing } from "@/theme/tokens/spacing";

export default function ProfileScreen() {
  const user = useStore((state) => state.auth.user);
  const logout = useStore((state) => state.auth.logout);

  return (
    <AppView style={styles.container}>
      <AppText variant="heading2">{user?.fullName}</AppText>
      <AppText variant="bodyMedium" color="muted" style={styles.email}>
        {user?.email}
      </AppText>
      <AppButton variant="secondary" onPress={logout} style={styles.button}>
        Logout
      </AppButton>
    </AppView>
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
    marginTop: spacing.xl,
    width: "100%",
  },
});
