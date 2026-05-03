import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function AppFieldSeperator() {
  return <View style={styles.container} data-no-padding={true} />;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.border,
  },
}));

(AppFieldSeperator as any).noPadding = true;
