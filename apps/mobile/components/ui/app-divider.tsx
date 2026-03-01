import { View, StyleSheet } from "react-native";
import { AppText } from "./app-text";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";

type AppDividerProps = {
  text?: string;
};

export function AppDivider({ text }: AppDividerProps) {
  const { theme } = useTheme();

  if (!text) {
    return (
      <View
        style={[
          styles.line,
          { backgroundColor: theme.border },
        ]}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      <AppText
        style={[
          styles.text,
          { color: theme.mutedForeground },
        ]}
      >
        {text}
      </AppText>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
