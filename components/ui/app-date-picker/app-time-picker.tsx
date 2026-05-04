import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { type DateParts } from "./date-time-utils";
import { ScrollDrum } from "./scroll-drum";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

type AppTimePickerProps = {
  parts: DateParts;
  onChange: (parts: DateParts) => void;
};

export function AppTimePicker({ parts, onChange }: AppTimePickerProps) {
  const handleHourChange = (index: number) => {
    onChange({ ...parts, hour: index });
  };

  const handleMinuteChange = (index: number) => {
    onChange({ ...parts, minute: index });
  };

  return (
    <View style={styles.container}>
      <ScrollDrum
        items={HOURS}
        selectedIndex={parts.hour}
        onIndexChange={handleHourChange}
      />
      <View style={styles.colon} />
      <ScrollDrum
        items={MINUTES}
        selectedIndex={parts.minute}
        onIndexChange={handleMinuteChange}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  colon: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
}));
