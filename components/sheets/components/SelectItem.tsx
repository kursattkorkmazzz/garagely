import { AppText } from "@/components/ui/app-text";
import { Check } from "lucide-react-native/icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type SelectItemProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
};

export function SelectItem({
  label,
  description,
  selected,
  onPress,
}: SelectItemProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={onPress}
      style={(s) => [
        styles.row,
        s.pressed && { backgroundColor: theme.colors.secondary },
      ]}
    >
      <View style={styles.left}>
        <AppText style={[styles.label, { color: theme.colors.foreground }]}>
          {label}
        </AppText>
        {description ? (
          <AppText
            style={[styles.description, { color: theme.colors.mutedForeground }]}
          >
            {description}
          </AppText>
        ) : null}
      </View>
      {selected ? <Check size={18} color={theme.colors.primary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    minHeight: 52,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...theme.typography.rowLabel,
  },
  description: {
    ...theme.typography.rowSub,
  },
}));
