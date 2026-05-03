import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AppFieldProps = {
  children?: React.ReactNode;
};

export function AppField({ children }: AppFieldProps) {
  return <View style={styles.fieldContainer}>{children}</View>;
}

const styles = StyleSheet.create((theme) => ({
  fieldContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.xs,
  },
}));
