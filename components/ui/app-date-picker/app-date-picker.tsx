import { useMemo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { daysInMonth, type DateParts } from "./date-time-utils";
import { ScrollDrum } from "./scroll-drum";

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 201 }, (_, i) => String(1900 + i));

type AppDatePickerProps = {
  parts: DateParts;
  onChange: (parts: DateParts) => void;
};

export function AppDatePicker({ parts, onChange }: AppDatePickerProps) {
  const maxDays = daysInMonth(parts.year, parts.month);
  const days = useMemo(
    () => Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0")),
    [maxDays],
  );

  const clampedDay = Math.min(parts.day, maxDays);

  const handleDayChange = (index: number) => {
    onChange({ ...parts, day: index + 1 });
  };

  const handleMonthChange = (index: number) => {
    const newMonth = index + 1;
    const newMaxDays = daysInMonth(parts.year, newMonth);
    const safeDay = Math.min(clampedDay, newMaxDays);
    onChange({ ...parts, day: safeDay, month: newMonth });
  };

  const handleYearChange = (index: number) => {
    const newYear = 1900 + index;
    const newMaxDays = daysInMonth(newYear, parts.month);
    const safeDay = Math.min(clampedDay, newMaxDays);
    onChange({ ...parts, day: safeDay, year: newYear });
  };

  return (
    <View style={styles.container}>
      <ScrollDrum
        items={days}
        selectedIndex={clampedDay - 1}
        onIndexChange={handleDayChange}
      />
      <View style={styles.divider} />
      <ScrollDrum
        items={MONTHS}
        selectedIndex={parts.month - 1}
        onIndexChange={handleMonthChange}
      />
      <View style={styles.divider} />
      <ScrollDrum
        items={YEARS}
        selectedIndex={parts.year - 1900}
        onIndexChange={handleYearChange}
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
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
}));
