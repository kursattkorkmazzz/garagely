import { AppTimePicker } from "@/components/ui/app-date-picker/app-time-picker";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function ShowcaseScreen() {
  return (
    <View style={styles.container}>
      <AppTimePicker />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
}));
