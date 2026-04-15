import { ThemeType, ThemeTypes } from "@/shared/theme";
import { colors, ThemeColors } from "@/theme/tokens/colors";
import { hexToRgba } from "@/theme/utils/hex-to-rgba";
import { createContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

export interface ThemeContextProps {
  theme: ThemeColors;
  selectedTheme: ThemeType;
  changeTheme: (theme: ThemeType) => Promise<void>;
  withOpacity: (color: keyof ThemeColors) => (opacityValue: number) => string;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: colors.light,
  selectedTheme: ThemeTypes.LIGHT,
  changeTheme: () => Promise.resolve(),
  withOpacity: () => () => "",
});

type ThemeProviderProps = {
  children?: React.ReactNode;
};
export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    ThemeTypes.SYSTEM,
  );

  const theme = useMemo(() => {
    if (selectedTheme === ThemeTypes.SYSTEM) {
      return colorScheme === "dark" ? colors.dark : colors.light;
    }
    return selectedTheme === ThemeTypes.DARK ? colors.dark : colors.light;
  }, [colorScheme, selectedTheme]);

  const changeTheme = async (theme: ThemeType) => {
    setSelectedTheme(theme);
  };

  const withOpacity = (color: keyof ThemeColors) => (opacityValue: number) => {
    return hexToRgba(theme[color] as string, opacityValue);
  };

  useEffect(() => {
    console.log("[+] Theme is initialized with", selectedTheme);
  }, []);
  return (
    <ThemeContext.Provider
      value={{ theme, changeTheme, selectedTheme, withOpacity }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
