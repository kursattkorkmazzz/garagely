import { AppDateTimePickerField } from "@/components/ui/app-date-picker/app-date-time-picker-field";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function ShowcaseScreen() {
  const [value, setValue] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <AppDateTimePickerField
        label="Tarih ve Saat"
        value={value}
        onChange={setValue}
        mode="datetime"
      />
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
