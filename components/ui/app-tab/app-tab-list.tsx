import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AppTabListProps = {
  children: ReactNode;
};

export function AppTabList({ children }: AppTabListProps) {
  return <View style={styles.list}>{children}</View>;
}

const styles = StyleSheet.create((theme) => ({
  list: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));
