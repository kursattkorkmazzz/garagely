import { useState } from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

type AppTextareaProps = Omit<TextInputProps, "multiline"> & {
  invalid?: boolean;
};

export function AppTextarea({
  invalid = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: AppTextareaProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (invalid) {
      return theme.destructive;
    }
    if (isFocused) {
      return theme.ring;
    }
    return theme.border;
  };

  const styles = StyleSheet.create({
    textarea: {
      backgroundColor: theme.secondary,
      borderRadius: radius * 2,
      borderWidth: 1,
      borderColor: getBorderColor(),
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: theme.foreground,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: "top",
    },
  });

  return (
    <TextInput
      {...rest}
      multiline
      style={[styles.textarea, style]}
      placeholderTextColor={theme.mutedForeground}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
    />
  );
}
