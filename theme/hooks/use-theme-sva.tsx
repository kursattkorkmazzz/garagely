import type { ThemeColors } from "@/theme/tokens/colors";
import type {
  SlotConfigVariants,
  SlotResult,
  SlotsSchema,
  SlotVariantsSchema,
  StaticSva,
  StyleValue,
} from "@/utils/sva/types";
import { useMemo } from "react";
import { useTheme } from "./use-theme";

/**
 * ThemedSva factory'sini reaktif olarak çalıştırır.
 * Tema veya props değişince SlotResult yeniden hesaplanır.
 *
 * @example
 * const buttonSva = sva((theme) => ({
 *   base: { root: { borderRadius: 8 }, text: {} },
 *   variants: { variant: { primary: { root: { backgroundColor: theme.primary } } } },
 * }));
 *
 * function Button({ variant, size }) {
 *   const { root, text } = useThemeSva(buttonSva, { variant, size });
 * }
 */
export function useThemeSva<
  S extends SlotsSchema,
  V extends SlotVariantsSchema<S>,
>(
  svaFactory: (theme: ThemeColors) => StaticSva<S, V>,
  props?: SlotConfigVariants<S, V>,
  ...extraSlotStyles: Partial<Record<keyof S, StyleValue>>[]
): SlotResult<S> {
  const { theme } = useTheme();

  return useMemo(
    () => svaFactory(theme)(props, ...extraSlotStyles),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, ...Object.values(props ?? {})],
  );
}
