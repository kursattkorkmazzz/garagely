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
import { AppText } from "./app-text";
import { AppView } from "./app-view";

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
  AppInputField: React.ReactElement<typeof AppInputField>;
  AppInputErrorMessage?: React.ReactElement<typeof AppInputErrorMessage>;
  AppInputLabel?: React.ReactElement<typeof AppInputLabel>;
};

export function AppInput({
  children,
  style,
  AppInputField,
  AppInputErrorMessage,
  AppInputLabel,
  ...rest
}: AppInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  const styles = StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
  });

  return (
    <InputContext.Provider value={{ isFocused, setIsFocused }}>
      <AppView style={styles.container}>
        {AppInputLabel}
        {AppInputField}
        {AppInputErrorMessage}
      </AppView>
    </InputContext.Provider>
  );
}

// InputField - The actual text input
type AppInputFieldProps = TextInputProps & {
  InputLeftAction?: React.ReactElement<typeof AppInputLeftAction>;
  InputRightAction?: React.ReactElement<typeof AppInputRightAction>;
};

export function AppInputField({
  style,
  onFocus,
  onBlur,
  InputLeftAction,
  InputRightAction,
  ...rest
}: AppInputFieldProps) {
  const { theme } = useTheme();
  const { isFocused, setIsFocused } = useInputContext();

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
    subContainer: {
      flexDirection: "row",
    },
    input: {
      flex: 1,
      color: theme.foreground,
      fontSize: 16,
      paddingVertical: spacing.sm,
      outline: "none",
    },
  });

  return (
    <AppView style={styles.container}>
      <AppView style={styles.subContainer}>
        {InputLeftAction}
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
        {InputRightAction}
      </AppView>
    </AppView>
  );
}

// InputLeftAction - Container for left side content
type AppInputActionProps = ViewProps & {
  children: ReactNode;
};

export function AppInputLeftAction({
  children,
  style,
  ...rest
}: AppInputActionProps) {
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
export function AppInputRightAction({
  children,
  style,
  ...rest
}: AppInputActionProps) {
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

// InputErrorMessageProps - Container for left side content
type AppInputErrorMessageProps = React.ComponentProps<typeof AppText>;

// InputErrorMessage - Container for right side content
export function AppInputErrorMessage({
  children,
  style,
  ...rest
}: AppInputErrorMessageProps) {
  const styles = StyleSheet.create({
    container: {
      paddingLeft: spacing.sm,
    },
  });

  return (
    <AppText
      {...rest}
      variant="bodySmall"
      color="destructive"
      style={[styles.container, style]}
    >
      {children}
    </AppText>
  );
}

type AppInputLabelProps = React.ComponentProps<typeof AppText>;
// AppInputLabel - Container for right side content
export function AppInputLabel({
  children,
  style,
  ...rest
}: AppInputLabelProps) {
  const styles = StyleSheet.create({
    container: {
      paddingLeft: spacing.sm,
    },
  });
  return (
    <AppText
      {...rest}
      variant="bodyMedium"
      color="muted"
      style={[styles.container, style]}
    >
      {children}
    </AppText>
  );
}
