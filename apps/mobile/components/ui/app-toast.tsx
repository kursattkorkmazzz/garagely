import { ReactNode, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Toasts,
  toast as baseToast,
  ToastOptions,
  ToastPosition,
  Toast,
} from "@backpackapp-io/react-native-toast";
import { Check, X, Loader, Info } from "lucide-react-native";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { colors, ThemeType } from "@/theme/tokens/colors";

// Re-export ToastPosition for convenience
export { ToastPosition };

// Module-level theme store for toast functions (updated by provider)
let currentTheme: ThemeType = colors.light;

export const setToastTheme = (theme: ThemeType) => {
  currentTheme = theme;
};

const getThemeColors = () => currentTheme;

// Custom toast options
type AppToastOptions = Omit<ToastOptions, "styles"> & {
  styles?: ToastOptions["styles"];
};

// Base pressable style (transparent to avoid black corners)
const basePressableStyle = {
  backgroundColor: "transparent",
};

// Custom toast renderer
const createCustomToast = (
  icon: ReactNode,
  backgroundColor: string,
  textColor: string,
  withBorder = false,
) => {
  return (toast: Toast) => {
    const theme = getThemeColors();
    const message =
      typeof toast.message === "function"
        ? toast.message(toast)
        : toast.message;

    return (
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor,
            borderRadius: radius * 2,
            ...(withBorder && {
              borderWidth: 1,
              borderColor: theme.border,
            }),
          },
        ]}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={[styles.toastText, { color: textColor }]}>{message}</Text>
      </View>
    );
  };
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 200,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
});

// Toast wrapper functions
export const appToast = Object.assign(
  (message: string, options?: AppToastOptions) => {
    const theme = getThemeColors();
    return baseToast(message, {
      position: ToastPosition.TOP,
      disableShadow: true,
      customToast: createCustomToast(
        <Info size={20} color={theme.foreground} />,
        theme.card,
        theme.foreground,
        true,
      ),
      ...options,
      styles: {
        pressable: basePressableStyle,
        ...options?.styles,
      },
    });
  },
  {
    success: (message: string, options?: AppToastOptions) => {
      const theme = getThemeColors();
      return baseToast.success(message, {
        position: ToastPosition.TOP,
        disableShadow: true,
        customToast: createCustomToast(
          <Check size={20} color="#ffffff" />,
          theme.color.green,
          "#ffffff",
        ),
        ...options,
        styles: {
          pressable: basePressableStyle,
          ...options?.styles,
        },
      });
    },

    error: (message: string, options?: AppToastOptions) => {
      const theme = getThemeColors();
      return baseToast.error(message, {
        position: ToastPosition.TOP,
        disableShadow: true,
        customToast: createCustomToast(
          <X size={20} color={theme.destructiveForeground} />,
          theme.destructive,
          theme.destructiveForeground,
        ),
        ...options,
        styles: {
          pressable: basePressableStyle,
          ...options?.styles,
        },
      });
    },

    loading: (message: string, options?: AppToastOptions) => {
      const theme = getThemeColors();
      return baseToast.loading(message, {
        position: ToastPosition.TOP,
        disableShadow: true,
        customToast: createCustomToast(
          <Loader size={20} color={theme.foreground} />,
          theme.card,
          theme.foreground,
          true,
        ),
        ...options,
        styles: {
          pressable: basePressableStyle,
          ...options?.styles,
        },
      });
    },

    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      },
      options?: AppToastOptions,
    ) => {
      const theme = getThemeColors();
      return baseToast.promise(
        promise,
        {
          loading: messages.loading,
          success: messages.success,
          error: messages.error,
        },
        {
          position: ToastPosition.TOP,
          disableShadow: true,
          customToast: createCustomToast(
            <Loader size={20} color={theme.foreground} />,
            theme.card,
            theme.foreground,
            true,
          ),
          ...options,
          styles: {
            pressable: basePressableStyle,
            ...options?.styles,
          },
        },
      );
    },

    dismiss: (id?: string) => {
      return baseToast.dismiss(id);
    },
  },
);

// Provider component to add Toasts to app root
type AppToastProviderProps = {
  children: ReactNode;
};

export function AppToastProvider({ children }: AppToastProviderProps) {
  const { theme } = useTheme();

  // Sync theme to module-level store for toast functions
  useEffect(() => {
    setToastTheme(theme);
  }, [theme]);

  return (
    <>
      {children}
      <Toasts
        defaultPosition={ToastPosition.TOP}
        extraInsets={{ top: 10 }}
        defaultStyle={{
          pressable: {
            backgroundColor: "transparent",
          },
        }}
      />
    </>
  );
}
