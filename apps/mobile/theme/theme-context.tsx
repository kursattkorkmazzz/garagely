import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useColorScheme } from "react-native";
import { colors, Theme, ThemeType } from "./tokens/colors";

// Context type
interface ThemeContextProps {
  theme: ThemeType;
  changeTheme: (theme: Theme) => void;
}

// Default value for the context
const ThemeContext = createContext<ThemeContextProps>({
  theme: colors.light,
  changeTheme: () => {},
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

  const [theme, setTheme] = useState<ThemeType>(
    colorScheme === "dark" ? colors.dark : colors.light,
  );

  useEffect(() => {
    setTheme(colorScheme === "dark" ? colors.dark : colors.light);
  }, [colorScheme]);

  const changeTheme = (theme: Theme) => {
    setTheme(colors[theme]);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
