import { AppText } from "@/components/ui/app-text";
import { StyleSheet } from "react-native-unistyles";

type AppFieldLabelProps = {
  children?: React.ReactNode;
};
export function AppFieldLabel({ children }: AppFieldLabelProps) {
  return <AppText style={styles.label}>{children}</AppText>;
}

const styles = StyleSheet.create((theme) => ({
  label: {
    ...theme.typography.label,
    color: theme.colors.mutedForeground,
  },
}));
