import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { colors, Theme, ThemeType } from "./tokens/colors";

// Context type
export interface ThemeContextProps {
  theme: ThemeType;
  themeName: Theme;
  changeTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  withOpacity: (color: string, opacity: number) => string;
}

// Default value for the context
const ThemeContext = createContext<ThemeContextProps>({
  theme: colors.light,
  themeName: "light",
  changeTheme: () => {},
  toggleTheme: () => {},
  withOpacity: () => {
    return "";
  },
});

// Theme Context Hook

export const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();

  // TODO: First load the theme from user_preferences, then fallback to system preference.

  const [themeName, setThemeName] = useState<Theme>(
    colorScheme === "dark" ? "dark" : "light",
  );

  const theme = colors[themeName];

  useEffect(() => {
    setThemeName(colorScheme === "dark" ? "dark" : "light");
  }, [colorScheme]);

  const changeTheme = (newTheme: Theme) => {
    setThemeName(newTheme);
  };

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const withOpacity = (color: string, opacity: number) => {
    const opacityHex = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    return color + opacityHex;
  };
  return (
    <ThemeContext.Provider
      value={{ theme, themeName, changeTheme, toggleTheme, withOpacity }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
