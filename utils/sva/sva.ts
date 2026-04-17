import type {
  SlotConfig,
  SlotConfigVariants,
  SlotFn,
  SlotResult,
  SlotVariantsSchema,
  SlotsSchema,
  StyleValue,
} from "./types";

function falsyToString<T>(value: T) {
  if (typeof value === "boolean") return `${value}`;
  if (value === 0) return "0";
  return value;
}

export default function sva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
>(
  config: SlotConfig<S, V>,
): (props?: SlotConfigVariants<S, V>, ...styles: Partial<Record<keyof S, StyleValue>>[]) => SlotResult<S> {
  return function (
    props?: SlotConfigVariants<S, V>,
    ...extraSlotStyles: Partial<Record<keyof S, StyleValue>>[]
  ): SlotResult<S> {
    const { base, variants, defaultVariants } = config;

    // Her slot için variant stilleri biriktir
    const accumulated: Record<string, StyleValue[]> = {};
    for (const slotName of Object.keys(base)) {
      accumulated[slotName] = [];
    }

    if (variants) {
      for (const variantName of Object.keys(variants)) {
        const variantProp = props?.[variantName as keyof typeof props];
        const defaultProp = defaultVariants?.[variantName as keyof typeof defaultVariants];

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

    // Her slot için closure üret
    const result = {} as SlotResult<S>;

    for (const slotName of Object.keys(base) as (keyof S)[]) {
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
