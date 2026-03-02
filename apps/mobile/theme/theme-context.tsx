import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import { colors, Theme, ThemeType } from "./tokens/colors";
import { useStore } from "@/stores";
import { Theme as BackendTheme } from "@garagely/shared/models/user-preferences";

// Context type
export interface ThemeContextProps {
  theme: ThemeType;
  themeName: Theme;
  themePreference: Theme | "system";
  changeTheme: (theme: Theme | "system") => void;
  toggleTheme: () => void;
  withOpacity: (color: string, opacity: number) => string;
  isUpdating: boolean;
}

// Default value for the context
const ThemeContext = createContext<ThemeContextProps>({
  theme: colors.light,
  themeName: "light",
  themePreference: "system",
  changeTheme: () => {},
  toggleTheme: () => {},
  withOpacity: () => {
    return "";
  },
  isUpdating: false,
});

// Theme Context Hook
export const useTheme = () => useContext(ThemeContext);

// Map backend theme to local theme
function mapBackendTheme(backendTheme: string | undefined): Theme | "system" {
  switch (backendTheme) {
    case BackendTheme.LIGHT:
      return "light";
    case BackendTheme.DARK:
      return "dark";
    case BackendTheme.SYSTEM:
      return "system";
    default:
      return "system";
  }
}

// Map local theme to backend theme
function mapToBackendTheme(theme: Theme | "system"): BackendTheme {
  switch (theme) {
    case "light":
      return BackendTheme.LIGHT;
    case "dark":
      return BackendTheme.DARK;
    case "system":
      return BackendTheme.SYSTEM;
    default:
      return BackendTheme.SYSTEM;
  }
}

// Theme Provider Component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const user = useStore((state) => state.auth.user);
  const updatePreferences = useStore((state) => state.preferences.updatePreferences);
  const setUser = useStore((state) => state.auth.setUser);
  const isUpdating = useStore((state) => state.preferences.isUpdating);

  // Theme preference from user preferences or default to system
  const [themePreference, setThemePreference] = useState<Theme | "system">("system");

  // Sync theme preference from user preferences
  useEffect(() => {
    if (user?.preferences?.theme) {
      setThemePreference(mapBackendTheme(user.preferences.theme));
    }
  }, [user?.preferences?.theme]);

  // Resolve actual theme based on preference and system color scheme
  const resolvedTheme: Theme = useMemo(() => {
    if (themePreference === "system") {
      return colorScheme === "dark" ? "dark" : "light";
    }
    return themePreference;
  }, [themePreference, colorScheme]);

  const theme = colors[resolvedTheme];

  const changeTheme = useCallback(
    async (newTheme: Theme | "system") => {
      setThemePreference(newTheme);

      // Update backend if user is authenticated
      if (user) {
        await updatePreferences(
          { theme: mapToBackendTheme(newTheme) },
          {
            onSuccess: (updatedUser) => {
              setUser(updatedUser);
            },
          },
        );
      }
    },
    [user, updatePreferences, setUser],
  );

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    changeTheme(newTheme);
  }, [resolvedTheme, changeTheme]);

  const withOpacity = useCallback((color: string, opacity: number) => {
    const opacityHex = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    return color + opacityHex;
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeName: resolvedTheme,
      themePreference,
      changeTheme,
      toggleTheme,
      withOpacity,
      isUpdating,
    }),
    [theme, resolvedTheme, themePreference, changeTheme, toggleTheme, withOpacity, isUpdating],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
