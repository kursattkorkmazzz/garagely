import React, { createContext, useContext, ReactNode } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewProps,
} from "react-native";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

// Context for sharing input state
interface InputContextProps {
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
}

const InputContext = createContext<InputContextProps | null>(null);

function useInputContext() {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error("Input components must be used within an AppInput");
  }
  return context;
}

// AppInput - Container component
type AppInputProps = ViewProps & {
  children: ReactNode;
};

export function AppInput({ children, style, ...rest }: AppInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.secondary,
      borderRadius: radius * 2,
      borderWidth: 1,
      borderColor: isFocused ? theme.ring : theme.border,
      paddingHorizontal: spacing.md,
      minHeight: 56,
    },
  });

  return (
    <InputContext.Provider value={{ isFocused, setIsFocused }}>
      <View {...rest} style={[styles.container, style]}>
        {children}
      </View>
    </InputContext.Provider>
  );
}

// InputField - The actual text input
type InputFieldProps = TextInputProps;

export function InputField({
  style,
  onFocus,
  onBlur,
  ...rest
}: InputFieldProps) {
  const { theme } = useTheme();
  const { setIsFocused } = useInputContext();

  const styles = StyleSheet.create({
    input: {
      flex: 1,
      color: theme.foreground,
      fontSize: 16,
      paddingVertical: spacing.sm,
      outline: "none",
    },
  });

  return (
    <TextInput
      {...rest}
      style={[styles.input, style]}
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

// InputLeftAction - Container for left side content
type InputActionProps = ViewProps & {
  children: ReactNode;
};

export function InputLeftAction({
  children,
  style,
  ...rest
}: InputActionProps) {
  const styles = StyleSheet.create({
    container: {
      marginRight: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View {...rest} style={[styles.container, style]}>
      {children}
    </View>
  );
}

// InputRightAction - Container for right side content
export function InputRightAction({
  children,
  style,
  ...rest
}: InputActionProps) {
  const styles = StyleSheet.create({
    container: {
      marginLeft: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View {...rest} style={[styles.container, style]}>
      {children}
    </View>
  );
}
