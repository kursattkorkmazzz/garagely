import React, { isValidElement } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppFieldGroupProps = {
  children?: React.ReactNode;
};
export function AppFieldGroup({ children }: AppFieldGroupProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      {React.Children.map(children, (child) => {
        if (
          !isValidElement<{
            noPadding?: boolean;
            style?: StyleProp<ViewStyle>;
          }>(child)
        )
          return child;

        const type = child.type as any;
        const isNoPadding = type.noPadding;

        if (isNoPadding === true) {
          return child;
        }
        return <View style={styles.paddingContainer}>{child}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  paddingContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.md,
  },
}));
