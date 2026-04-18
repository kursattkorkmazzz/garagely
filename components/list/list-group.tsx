// Grup kartı — birden fazla AppListItem'ı gruplayıp aralarına divider koyar.
// Variant 1 (Modern Minimal) kart hiyerarşisi.

import { Children, ReactElement, ReactNode, isValidElement } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AppListGroupProps = {
  children: ReactNode;
};

export function AppListGroup({ children }: AppListGroupProps) {
  const items = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement[];

  return (
    <View style={styles.card}>
      {items.map((child, i) => (
        <View key={child.key ?? i}>
          {child}
          {i < items.length - 1 ? <AppListDivider /> : null}
        </View>
      ))}
    </View>
  );
}

function AppListDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    marginLeft: theme.spacing.md + 30 + (theme.spacing.md - 2), // inset: padding + icon + gap
    backgroundColor: theme.colors.border,
  },
}));
