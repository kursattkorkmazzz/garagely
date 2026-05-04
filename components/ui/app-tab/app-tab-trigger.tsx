import { AppText } from "@/components/ui/app-text";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTabContext } from "./tab-context";

type AppTabTriggerProps = {
  value: string;
  children: string;
};

export function AppTabTrigger({ value, children }: AppTabTriggerProps) {
  const { value: activeValue, onChange } = useTabContext();
  const { theme } = useUnistyles();
  const isActive = activeValue === value;

  return (
    <Pressable
      style={styles.trigger}
      onPress={() => onChange(value)}
    >
      <AppText
        style={[
          styles.label,
          { color: isActive ? theme.colors.primary : theme.colors.mutedForeground },
        ]}
      >
        {children}
      </AppText>
      {isActive && <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  trigger: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    position: "relative",
  },
  label: {
    ...theme.typography.buttonSmall,
  },
  indicator: {
    position: "absolute",
    bottom: -1,
    left: theme.spacing.md,
    right: theme.spacing.md,
    height: 2,
    borderRadius: theme.radius.full,
  },
}));
