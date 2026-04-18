import { AppTheme, AppThemeType } from "@/theme/theme";
import { StyleSheet } from "react-native-unistyles";

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemeType {}
}

console.log("[+] Stylesheet configured!");

StyleSheet.configure({
  themes: AppTheme,
  settings: {
    initialTheme: "light",
  },
});
