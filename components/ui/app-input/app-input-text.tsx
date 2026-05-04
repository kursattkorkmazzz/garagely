import { Text, TextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const stylesheet = StyleSheet.create((theme) => ({
  text: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
  },
}));

export type AppInputTextProps = TextProps;

export function AppInputText({ children }: AppInputTextProps) {
  return <Text style={stylesheet.text}>{children}</Text>;
}
