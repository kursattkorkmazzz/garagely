import type { ThemeColors } from "@/theme/tokens/colors";
import { useMemo } from "react";
import { useTheme } from "./use-theme";

/**
 * Modül seviyesinde tanımlanan style factory'lerini reaktif olarak hesaplar.
 * factory referansı değişmediği sürece sadece tema değişince yeniden çalışır.
 *
 * @example
 * const cardStyles = (theme: ThemeColors) => ({
 *   container: { backgroundColor: theme.card },
 *   title:     { color: theme.cardForeground },
 * });
 *
 * function Card() {
 *   const s = useThemeStyles(cardStyles);
 *   return <View style={s.container} />;
 * }
 */
export function useThemeStyles<T extends object>(
  factory: (theme: ThemeColors) => T,
): T {
  const { theme } = useTheme();
  // factory modül seviyesi sabit ref → dep dizisine girmez, sadece theme değişince tetiklenir
  return useMemo(() => factory(theme), [theme]);
}
