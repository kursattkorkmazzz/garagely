import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const stylesheet = StyleSheet.create((theme) => ({
  text: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
  },
}));

export type AppInputTextProps = {
  children: string;
};

export function AppInputText({ children }: AppInputTextProps) {
  return <Text style={stylesheet.text}>{children}</Text>;
}
