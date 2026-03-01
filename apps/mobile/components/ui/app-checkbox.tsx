import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";

type AppCheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
};

const sizeValues = {
  sm: 16,
  default: 20,
  lg: 24,
};

export function AppCheckbox({
  checked,
  onChange,
  disabled = false,
  size = "default",
}: AppCheckboxProps) {
  const { theme } = useTheme();
  const [internalChecked, setInternalChecked] = useState(false);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handlePress = () => {
    if (disabled) return;
    const newValue = !isChecked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  const boxSize = sizeValues[size];
  const iconSize = boxSize - 6;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.checkbox,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: radius,
          borderColor: isChecked ? theme.primary : theme.border,
          backgroundColor: isChecked ? theme.primary : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {isChecked && <Check size={iconSize} color={theme.primaryForeground} strokeWidth={3} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
