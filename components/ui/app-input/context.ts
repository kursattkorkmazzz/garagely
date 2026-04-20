import { createContext, useContext } from "react";
import { UnistylesVariants } from "react-native-unistyles";
import { groupStylesheet } from "./group.stylesheet";

export type InputGroupSize = NonNullable<UnistylesVariants<typeof groupStylesheet>["size"]>;

type InputGroupContextValue = {
  size: InputGroupSize;
  focused: boolean;
  setFocused: (v: boolean) => void;
  disabled: boolean;
  error: boolean;
};

export const InputGroupContext = createContext<InputGroupContextValue>({
  size: "md",
  focused: false,
  setFocused: () => {},
  disabled: false,
  error: false,
});

export const useInputGroup = () => useContext(InputGroupContext);
