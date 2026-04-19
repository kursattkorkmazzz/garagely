import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

const stylesheet = StyleSheet.create((theme) => ({
  track: {
    justifyContent: "center" as const,
    variants: {
      size: {
        sm: { width: 36, height: 22, borderRadius: 22 },
        md: { width: 44, height: 26, borderRadius: 26 },
      },
      active: {
        on:  { backgroundColor: theme.colors.primary },
        off: { backgroundColor: theme.colors.input },
      },
      isDisabled: {
        true:  { opacity: 0.5 },
        false: { opacity: 1 },
      },
    },
  },

  knob: {
    backgroundColor: "#ffffff",
    position: "absolute" as const,
    top: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    variants: {
      size: {
        sm: { width: 18, height: 18, borderRadius: 9 },
        md: { width: 22, height: 22, borderRadius: 11 },
      },
      active: {
        on:  {},
        off: {},
      },
    },
    compoundVariants: [
      { size: "sm", active: "on",  styles: { transform: [{ translateX: 16 }] } },
      { size: "sm", active: "off", styles: { transform: [{ translateX: 2 }] } },
      { size: "md", active: "on",  styles: { transform: [{ translateX: 20 }] } },
      { size: "md", active: "off", styles: { transform: [{ translateX: 2 }] } },
    ],
  },
}));

type SizeVariant = NonNullable<UnistylesVariants<typeof stylesheet>["size"]>;

type AppToggleProps = {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
  size?: SizeVariant;
};

export function AppToggle({
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  size = "md",
}: AppToggleProps) {
  const [inner, setInner] = useState(defaultValue);
  const on = value ?? inner;

  stylesheet.useVariants({
    size,
    active: on ? "on" : "off",
    isDisabled: disabled ? "true" : "false",
  });

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        const next = !on;
        setInner(next);
        onValueChange?.(next);
      }}
      style={stylesheet.track}
    >
      <View style={stylesheet.knob} />
    </Pressable>
  );
}
