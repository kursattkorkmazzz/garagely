import { useMemo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { localToUtc, utcToLocal } from "./date-time-utils";
import { ScrollDrum } from "./scroll-drum";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

type AppTimePickerProps = {
  utcMs: number;
  timezone: string;
  onChange: (utcMs: number) => void;
};

export function AppTimePicker({ utcMs, timezone, onChange }: AppTimePickerProps) {
  const parts = useMemo(() => utcToLocal(utcMs, timezone), [utcMs, timezone]);

  const handleHourChange = (index: number) => {
    onChange(localToUtc({ ...parts, hour: index }, timezone));
  };

  const handleMinuteChange = (index: number) => {
    onChange(localToUtc({ ...parts, minute: index }, timezone));
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
