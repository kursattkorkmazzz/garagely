import { AppText } from "@/components/ui/app-text";
import React, { isValidElement } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AppFieldGroupProps = {
  children?: React.ReactNode;
  label?: string;
  description?: string;
};
export function AppFieldGroup({
  children,
  label,
  description,
}: AppFieldGroupProps) {
  return (
    <View style={styles.groupContainer}>
      {label && <AppText style={styles.groupLabel}>{label}</AppText>}
      {description && (
        <AppText style={styles.groupDescription}>{description}</AppText>
      )}
      <View style={styles.fieldContainer}>
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
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  groupContainer: {
    display: "flex",
    width: "100%",
    gap: theme.spacing.sm,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  groupLabel: {
    ...theme.typography.label,
    color: theme.colors.mutedForeground,
  },
  groupDescription: {
    ...theme.typography.helperText,
    color: theme.colors.mutedForeground,
  },
  fieldContainer: {
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
