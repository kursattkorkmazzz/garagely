import type { Config, ConfigSchema, Props, StyleValue } from "./types";

function falsyToString<T extends unknown>(value: T) {
  if (typeof value == "boolean") {
    return `${value}`;
  }

  if (value === 0) {
    return "0";
  }

  return value;
}

export default function sva<T extends ConfigSchema>(
  config?: Config<T>,
): (props?: Props<T>, ...styles: StyleValue[]) => StyleValue {
  return function (props?: Props<T>, ...extraStyles: StyleValue[]) {
    if (!config?.variants) {
      return extraStyles.length
        ? [config?.base, ...extraStyles]
        : config?.base;
    }

    const { variants, defaultVariants } = config;

    const variantStyles = Object.keys(variants).map(
      (variant: keyof typeof variants) => {
        // e.g: variant = size

        // e.g: variantProp = md
        const variantProp = props?.[variant];

        // e.g: variantProp = sm
        const defaultVariantProp = defaultVariants?.[variant];

        const variantKey = (falsyToString(variantProp) ||
          falsyToString(
            defaultVariantProp,
          )) as keyof (typeof variants)[typeof variant];

        return variants[variant][variantKey];
      },
    );

    if (config.base) {
      return [config.base, ...variantStyles, ...extraStyles];
    }

    return [...variantStyles, ...extraStyles];
  };
}
