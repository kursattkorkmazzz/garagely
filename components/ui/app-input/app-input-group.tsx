import { ReactNode, useState } from "react";
import { View, ViewStyle } from "react-native";
import { UnistylesVariants } from "react-native-unistyles";
import { InputGroupContext } from "./context";
import { groupStylesheet } from "./group.stylesheet";

type GroupVariants = UnistylesVariants<typeof groupStylesheet>;

export type AppInputGroupProps = {
  size?: GroupVariants["size"];
  error?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  children: ReactNode;
};

export function AppInputGroup({
  size = "md",
  error = false,
  disabled = false,
  style,
  children,
}: AppInputGroupProps) {
  const [focused, setFocused] = useState(false);

  groupStylesheet.useVariants({
    size,
    focused: focused ? "true" : "false",
    error: error ? "true" : "false",
    disabled: disabled ? "true" : "false",
  });

  return (
    <InputGroupContext.Provider value={{ size, focused, setFocused, disabled, error }}>
      <View style={[groupStylesheet.container, style]}>{children}</View>
    </InputGroupContext.Provider>
  );
}
