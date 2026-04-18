// Segmented control — Variant 1
// Theme / birim seçimleri için kompakt segment anahtar.

import { AppText } from "@/components/ui/app-text";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppSegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange?: (next: T) => void;
};

export function AppSegmented<T extends string>({
  options,
  value,
  onChange,
}: AppSegmentedProps<T>) {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.input }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange?.(o.value)}
            style={[
              styles.segment,
              active && {
                backgroundColor: theme.colors.card,
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 2,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              },
            ]}
          >
            <AppText
              style={[
                styles.label,
                {
                  color: active
                    ? theme.colors.foreground
                    : theme.colors.mutedForeground,
                },
              ]}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    padding: 3,
    borderRadius: theme.radius.md + 2,
    gap: 2,
  },
  segment: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  label: {
    ...theme.typography.buttonSmall,
    fontSize: 12,
  },
}));
