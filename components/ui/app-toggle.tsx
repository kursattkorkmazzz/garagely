// Toggle / Switch — Variant 1 (Modern Minimal)
// Tıklanabilir, kontrollü veya kontrolsüz.

import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppToggleProps = {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function AppToggle({
  value,
  defaultValue = false,
  onValueChange,
  disabled,
  size = "md",
}: AppToggleProps) {
  const { theme } = useUnistyles();
  const [inner, setInner] = useState(defaultValue);
  const on = value ?? inner;

  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 22 : 26;
  const knob = h - 4;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        const next = !on;
        setInner(next);
        onValueChange?.(next);
      }}
      style={[
        styles.track,
        {
          width: w,
          height: h,
          borderRadius: h,
          backgroundColor: on ? theme.colors.primary : theme.colors.input,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.knob,
          {
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            transform: [{ translateX: on ? w - knob - 2 : 2 }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create(() => ({
  track: {
    justifyContent: "center",
  },
  knob: {
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
}));
