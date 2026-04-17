import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";

export type StyleValue = StyleProp<ViewStyle & TextStyle & ImageStyle>;

type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

// Slot tanımları: slot ismi → base StyleValue
export type SlotsSchema = Record<string, StyleValue>;

// Bir variant değeri için slot stilleri (tüm slot'ları doldurmak zorunda değil)
export type SlotVariantValue<S extends SlotsSchema> = Partial<
  Record<keyof S, StyleValue>
>;

// Variants: variant ismi → (değer → slot stilleri)
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

// Her slot için rest-style kabul eden fonksiyon
export type SlotFn = (...styles: StyleValue[]) => StyleValue;

// sva() çağrısının dönüş tipi: slot ismi → SlotFn
export type SlotResult<S extends SlotsSchema> = {
  [K in keyof S]: SlotFn;
};

export type OmitUndefined<T> = T extends undefined ? never : T;

// VariantProps<typeof buttonSva> → { variant?: "primary"|"outline", size?: "sm"|"lg" }
export type VariantProps<Component extends (...args: any) => any> =
  OmitUndefined<Parameters<Component>[0]>;
