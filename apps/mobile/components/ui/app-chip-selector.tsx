import { View, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "@/components/ui/app-text";
import { AppIcon, type IconName } from "@/components/ui/app-icon";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

export type ChipOption = {
  value: string;
  label: string;
  icon?: IconName;
};

type AppChipSelectorProps = {
  options: ChipOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
  onSelectedValuesChange?: (values: string[]) => void;
  scrollable?: boolean;
  label?: string;
};

export function AppChipSelector({
  options,
  value,
  onValueChange,
  multiSelect = false,
  selectedValues = [],
  onSelectedValuesChange,
  scrollable = false,
  label,
}: AppChipSelectorProps) {
  const { theme, withOpacity } = useTheme();

  const handlePress = (optionValue: string) => {
    if (multiSelect) {
      const isSelected = selectedValues.includes(optionValue);
      const newValues = isSelected
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onSelectedValuesChange?.(newValues);
    } else {
      onValueChange?.(optionValue);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiSelect) {
      return selectedValues.includes(optionValue);
    }
    return value === optionValue;
  };

  const renderChips = () => (
    <View style={styles.chipsContainer}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected
                  ? theme.primary
                  : withOpacity(theme.muted, 0.3),
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {option.icon && (
              <AppIcon
                icon={option.icon}
                size={16}
                color={selected ? theme.primaryForeground : theme.foreground}
              />
            )}
            <AppText
              variant="bodySmall"
              style={{
                color: selected ? theme.primaryForeground : theme.foreground,
                fontWeight: selected ? "600" : "400",
              }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="bodySmall" color="muted" style={styles.label}>
          {label}
        </AppText>
      )}
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderChips()}
        </ScrollView>
      ) : (
        renderChips()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius * 2,
  },
});
