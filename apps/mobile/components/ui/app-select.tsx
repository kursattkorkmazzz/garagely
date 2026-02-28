import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { AppText } from "./app-text";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";

// Context for sharing select state
interface SelectContextProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder?: string;
  displayText?: string;
  setDisplayText: (text: string) => void;
}

const SelectContext = createContext<SelectContextProps | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within an AppSelect");
  }
  return context;
}

// AppSelect - Container component
type AppSelectProps = {
  children: ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
};

export function AppSelect({
  children,
  value: controlledValue,
  onValueChange,
  defaultValue,
}: AppSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [displayText, setDisplayText] = useState<string | undefined>();

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        displayText,
        setDisplayText,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

// AppSelectTrigger - The button that opens the dropdown
type AppSelectTriggerProps = {
  children: ReactNode;
  disabled?: boolean;
};

export function AppSelectTrigger({ children, disabled }: AppSelectTriggerProps) {
  const { theme } = useTheme();
  const { open, setOpen } = useSelectContext();

  return (
    <Pressable
      onPress={() => !disabled && setOpen(!open)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.trigger,
        {
          backgroundColor: theme.secondary,
          borderColor: theme.border,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.triggerContent}>{children}</View>
      <ChevronDown size={20} color={theme.mutedForeground} />
    </Pressable>
  );
}

// AppSelectValue - Shows the selected value or placeholder
type AppSelectValueProps = {
  placeholder?: string;
};

export function AppSelectValue({ placeholder }: AppSelectValueProps) {
  const { theme } = useTheme();
  const { value, displayText } = useSelectContext();

  const hasValue = value !== undefined && displayText;

  return (
    <AppText
      style={{
        color: hasValue ? theme.foreground : theme.mutedForeground,
        fontSize: 16,
      }}
    >
      {hasValue ? displayText : placeholder}
    </AppText>
  );
}

// AppSelectContent - The dropdown content container
type AppSelectContentProps = {
  children: ReactNode;
};

export function AppSelectContent({ children }: AppSelectContentProps) {
  const { theme } = useTheme();
  const { open, setOpen } = useSelectContext();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableWithoutFeedback onPress={() => setOpen(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// AppSelectGroup - Groups items together
type AppSelectGroupProps = {
  children: ReactNode;
  label?: string;
};

export function AppSelectGroup({ children, label }: AppSelectGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.group}>
      {label && (
        <AppText
          style={[
            styles.groupLabel,
            { color: theme.mutedForeground },
          ]}
        >
          {label}
        </AppText>
      )}
      {children}
    </View>
  );
}

// AppSelectItem - Individual selectable items
type AppSelectItemProps = {
  children: ReactNode;
  value: string;
  disabled?: boolean;
};

export function AppSelectItem({
  children,
  value,
  disabled,
}: AppSelectItemProps) {
  const { theme } = useTheme();
  const {
    value: selectedValue,
    onValueChange,
    setDisplayText,
  } = useSelectContext();

  const isSelected = selectedValue === value;

  const handlePress = () => {
    if (disabled) return;
    // Extract text from children for display
    const text =
      typeof children === "string"
        ? children
        : React.Children.toArray(children)
            .filter((child) => typeof child === "string")
            .join("");
    setDisplayText(text);
    onValueChange(value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: pressed
            ? theme.muted
            : isSelected
              ? theme.secondary
              : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.itemContent}>
        <AppText
          style={{
            color: theme.foreground,
            fontSize: 16,
          }}
        >
          {children}
        </AppText>
      </View>
      {isSelected && <Check size={18} color={theme.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius * 2,
    borderWidth: 1,
    minHeight: 48,
  },
  triggerContent: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  content: {
    width: "100%",
    maxHeight: 300,
    borderRadius: radius * 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  scrollView: {
    padding: spacing.xs,
  },
  group: {
    paddingVertical: spacing.xs,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textTransform: "uppercase",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius,
    minHeight: 44,
  },
  itemContent: {
    flex: 1,
  },
});
