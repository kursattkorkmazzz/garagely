import { useState } from "react";
import { Switch, SwitchProps, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/theme-context";

type SwitchSize = "sm" | "default" | "lg";

type AppSwitchProps = Omit<
  SwitchProps,
  "value" | "onValueChange" | "onChange"
> & {
  size?: SwitchSize;
  invalid?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
};

const sizeScales: Record<SwitchSize, number> = {
  sm: 0.8,
  default: 1,
  lg: 1.2,
};

export function AppSwitch({
  size = "default",
  disabled = false,
  invalid = false,
  value,
  onChange,
  ...rest
}: AppSwitchProps) {
  const { theme, withOpacity } = useTheme();
  const [internalValue, setInternalValue] = useState(false);

  const isControlled = value !== undefined;
  const isOn = isControlled ? value : internalValue;

  const handleChange = (newValue: boolean) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const getTrackColor = () => {
    if (invalid) {
      return {
        false: theme.destructive,
        true: theme.destructive,
      };
    }
    return {
      false: theme.muted,
      true: theme.primary,
    };
  };

  const getThumbColor = () => {
    if (invalid) {
      return withOpacity(theme.destructive, 0.8);
    }
    return isOn ? theme.primaryForeground : theme.card;
  };

  const scale = sizeScales[size];

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      <Switch
        {...rest}
        value={isOn}
        onValueChange={handleChange}
        disabled={disabled}
        style={[disabled ? styles.disabled : undefined]}
        trackColor={getTrackColor()}
        thumbColor={getThumbColor()}
        ios_backgroundColor={invalid ? theme.destructive : theme.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
  disabled: {
    opacity: 0.4,
  },
});
