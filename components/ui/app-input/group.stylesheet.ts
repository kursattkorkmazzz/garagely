import { StyleSheet } from "react-native-unistyles";

export const groupStylesheet = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    overflow: "hidden" as const,
    backgroundColor: theme.colors.background,
    variants: {
      size: {
        sm: { minHeight: 36, borderRadius: theme.radius.sm },
        md: { minHeight: 44, borderRadius: theme.radius.md },
        lg: { minHeight: 56, borderRadius: theme.radius.lg },
      },
      focused: {
        true: { borderColor: theme.colors.ring },
        false: { borderColor: theme.colors.border },
      },
      error: {
        true: { borderColor: theme.colors.destructive },
        false: {},
      },
      disabled: {
        true: { opacity: 0.5 },
        false: {},
      },
    },
  },
}));
