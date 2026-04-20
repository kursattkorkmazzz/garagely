import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useInputGroup } from "./context";

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: theme.colors.secondary,
    variants: {
      position: {
        left: {
          borderRightWidth: 1,
          borderRightColor: theme.colors.border,
        },
        right: {
          borderLeftWidth: 1,
          borderLeftColor: theme.colors.border,
        },
      },
      size: {
        sm: { paddingHorizontal: theme.spacing.xs, minWidth: 36 },
        md: { paddingHorizontal: theme.spacing.sm, minWidth: 44 },
        lg: { paddingHorizontal: theme.spacing.md, minWidth: 52 },
      },
    },
  },
}));

type AddonVariants = UnistylesVariants<typeof stylesheet>;

export type AppInputAddonProps = {
  position?: AddonVariants["position"];
  children: ReactNode;
};

export function AppInputAddon({ position = "left", children }: AppInputAddonProps) {
  const { size } = useInputGroup();

  stylesheet.useVariants({ position, size });

  return <View style={stylesheet.container}>{children}</View>;
}
