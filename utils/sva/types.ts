import type { ThemeColors } from "@/theme/tokens/colors";
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";

export type StyleValue = StyleProp<ViewStyle & TextStyle & ImageStyle>;
export type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

export type SlotsSchema = Record<string, StyleValue>;

export type SlotVariantValue<S extends SlotsSchema> = Partial<
  Record<keyof S, StyleValue>
>;

export type SlotVariantsSchema<S extends SlotsSchema> = Record<
  string,
  Record<string, SlotVariantValue<S>>
>;

export type SlotConfigVariants<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]> | null | undefined;
};

export interface SlotConfig<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
> {
  base: S;
  variants?: V;
  defaultVariants?: SlotConfigVariants<S, V>;
}

export type SlotFn = (...styles: StyleValue[]) => StyleValue;

export type SlotResult<S extends SlotsSchema> = { [K in keyof S]: SlotFn };

export type StaticSva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
> = (
  props?: SlotConfigVariants<S, V>,
  ...styles: Partial<Record<keyof S, StyleValue>>[]
) => SlotResult<S>;

export type ThemedSva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
> = (theme: ThemeColors) => StaticSva<S, V>;

export type OmitUndefined<T> = T extends undefined ? never : T;

// ThemedSva ve StaticSva her ikisini de destekler:
// - StaticSva        → Parameters[0] = variant props
// - ThemedSva        → (theme) => StaticSva → iç fonksiyonun Parameters[0] = variant props
export type VariantProps<Component extends (...args: any) => any> =
  Component extends (theme: ThemeColors) => infer Inner
    ? Inner extends (...args: any) => any
      ? OmitUndefined<Parameters<Inner>[0]>
      : never
    : OmitUndefined<Parameters<Component>[0]>;
