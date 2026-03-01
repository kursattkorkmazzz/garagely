import { View, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppView } from "@/components/ui/app-view";
import { spacing } from "@/theme/tokens/spacing";

export default function AlertsScreen() {
  return (
    <AppView style={styles.container}>
      <AppText variant="heading2">Alerts</AppText>
      <AppText variant="bodyMedium" color="muted" style={styles.subtitle}>
        Your notifications will appear here
      </AppText>
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
  subtitle: {
    marginTop: spacing.xs,
  },
});
