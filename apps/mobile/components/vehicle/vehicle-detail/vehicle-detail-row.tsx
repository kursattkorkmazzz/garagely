import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "@/components/ui/app-text";
import { AppView } from "@/components/ui/app-view";
import { spacing } from "@/theme/tokens/spacing";

type VehicleDetailRowProps = {
  label: string;
  value: string;
  valueColor?: string;
  colorDot?: string; // Hex color for color indicator dot
};

export function VehicleDetailRow({
  label,
  value,
  valueColor,
  colorDot,
}: VehicleDetailRowProps) {
  const { theme } = useTheme();

  return (
    <AppView
      style={[styles.row, { borderBottomColor: theme.border }]}
    >
      <AppText variant="bodyMedium" color="muted">
        {label}
      </AppText>
      <View style={styles.valueContainer}>
        <AppText
          variant="bodyMedium"
          style={[
            styles.value,
            { color: valueColor || theme.foreground },
          ]}
        >
          {value}
        </AppText>
        {colorDot && (
          <View
            style={[styles.colorDot, { backgroundColor: colorDot }]}
          />
        )}
      </View>
    </AppView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  value: {
    fontWeight: "500",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
});
