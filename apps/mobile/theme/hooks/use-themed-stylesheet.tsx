import { StyleSheet } from "react-native";
import { ThemeType } from "../tokens/colors";
import { useTheme } from "../theme-context";
import { DependencyList, useMemo } from "react";

export function useThemedStylesheet<T extends StyleSheet.NamedStyles<T>>(
  styles: (theme: ThemeType) => T,
  dependencyList?: DependencyList,
) {
  const { theme } = useTheme();
  return useMemo(() => styles(theme), [theme, dependencyList]);
}
