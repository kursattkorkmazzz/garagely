import { TextInput, TextInputProps } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useInputGroup } from "./context";

const stylesheet = StyleSheet.create((theme) => ({
  input: {
    flex: 1,
    color: theme.colors.foreground,
    ...theme.typography.bodyMedium,
    variants: {
      size: {
        sm: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        },
        md: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
        },
        lg: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
      },
    },
  },
}));

export type AppInputFieldProps = TextInputProps;

export function AppInputField({ onFocus, onBlur, style, editable, ...rest }: AppInputFieldProps) {
  const { size, setFocused, disabled } = useInputGroup();
  const { theme } = useUnistyles();

  stylesheet.useVariants({ size });

  return (
    <TextInput
      style={[stylesheet.input, style]}
      editable={editable !== undefined ? editable : !disabled}
      placeholderTextColor={theme.colors.mutedForeground}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
