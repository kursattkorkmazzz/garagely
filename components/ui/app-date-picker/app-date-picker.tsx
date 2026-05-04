import { useMemo, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { daysInMonth, localToUtc, utcToLocal } from "./date-time-utils";
import { ScrollDrum } from "./scroll-drum";

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 201 }, (_, i) => String(1900 + i));

type AppDatePickerProps = {
  utcMs: number;
  timezone: string;
  onChange: (utcMs: number) => void;
};

export function AppDatePicker({ utcMs, timezone, onChange }: AppDatePickerProps) {
  const parts = useMemo(() => utcToLocal(utcMs, timezone), [utcMs, timezone]);

  const [localMonth, setLocalMonth] = useState(parts.month);
  const [localYear, setLocalYear] = useState(parts.year);

  const maxDays = daysInMonth(localYear, localMonth);
  const days = useMemo(
    () => Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0")),
    [maxDays],
  );

  const clampedDay = Math.min(parts.day, maxDays);

  const handleDayChange = (index: number) => {
    onChange(localToUtc({ ...parts, day: index + 1, month: localMonth, year: localYear }, timezone));
  };

  const handleMonthChange = (index: number) => {
    const newMonth = index + 1;
    const newMaxDays = daysInMonth(localYear, newMonth);
    const safeDay = Math.min(clampedDay, newMaxDays);
    setLocalMonth(newMonth);
    onChange(localToUtc({ ...parts, day: safeDay, month: newMonth, year: localYear }, timezone));
  };

  const handleYearChange = (index: number) => {
    const newYear = 1900 + index;
    const newMaxDays = daysInMonth(newYear, localMonth);
    const safeDay = Math.min(clampedDay, newMaxDays);
    setLocalYear(newYear);
    onChange(localToUtc({ ...parts, day: safeDay, month: localMonth, year: newYear }, timezone));
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
        selectedIndex={localMonth - 1}
        onIndexChange={handleMonthChange}
      />
      <View style={styles.divider} />
      <ScrollDrum
        items={YEARS}
        selectedIndex={localYear - 1900}
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
