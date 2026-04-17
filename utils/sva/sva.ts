import type { ThemeColors } from "@/theme/tokens/colors";
import type {
  SlotConfig,
  SlotConfigVariants,
  SlotFn,
  SlotResult,
  SlotVariantsSchema,
  SlotsSchema,
  StaticSva,
  StyleValue,
  ThemedSva,
} from "./types";

function falsyToString<T>(value: T) {
  if (typeof value === "boolean") return `${value}`;
  if (value === 0) return "0";
  return value;
}

function buildSva<S extends SlotsSchema, V extends SlotVariantsSchema<S>>(
  config: SlotConfig<S, V>,
): StaticSva<S, V> {
  const { base, variants, defaultVariants } = config;
  const slotNames = Object.keys(base) as (keyof S)[];

  return function (
    props?: SlotConfigVariants<S, V>,
    ...extraSlotStyles: Partial<Record<keyof S, StyleValue>>[]
  ): SlotResult<S> {
    // Her slot için variant stillerini biriktir
    const accumulated: Record<string, StyleValue[]> = {};
    for (const name of slotNames) accumulated[name as string] = [];

    if (variants) {
      for (const variantName of Object.keys(variants)) {
        const variantProp = props?.[variantName as keyof typeof props];
        const defaultProp =
          defaultVariants?.[variantName as keyof typeof defaultVariants];
        const key = (falsyToString(variantProp) ||
          falsyToString(defaultProp)) as string;
        const slotStyles = variants[variantName][key];
        if (slotStyles) {
          for (const [slotName, style] of Object.entries(slotStyles)) {
            accumulated[slotName]?.push(style as StyleValue);
          }
        }
      }
    }

    const result = {} as SlotResult<S>;

    for (const slotName of slotNames) {
      const baseStyle = base[slotName];
      const variantStyles = accumulated[slotName as string];
      const extraStyles = extraSlotStyles
        .map((s) => s[slotName])
        .filter(Boolean) as StyleValue[];

      const slotFn: SlotFn = (...inlineStyles: StyleValue[]) => [
        baseStyle,
        ...variantStyles,
        ...extraStyles,
        ...inlineStyles,
      ];

      result[slotName] = slotFn;
    }

    return result;
  };
}

// Overload: statik config
export default function sva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
>(config: SlotConfig<S, V>): StaticSva<S, V>;

// Overload: tema factory
export default function sva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
>(factory: (theme: ThemeColors) => SlotConfig<S, V>): ThemedSva<S, V>;

export default function sva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
>(
  input: SlotConfig<S, V> | ((theme: ThemeColors) => SlotConfig<S, V>),
): StaticSva<S, V> | ThemedSva<S, V> {
  if (typeof input === "function") {
    // Factory mod: her theme değişiminde yeniden hesaplanır
    return (theme: ThemeColors) => buildSva(input(theme));
  }
  // Statik mod: bir kez derlenir
  return buildSva(input);
}
