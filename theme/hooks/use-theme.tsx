import { ThemeContext } from "@react-navigation/native";
import { useContext } from "react";

export function useTheme() {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return themeContext;
}
