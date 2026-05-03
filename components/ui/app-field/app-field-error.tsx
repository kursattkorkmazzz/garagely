import { AppText } from "@/components/ui/app-text";
import { StyleSheet } from "react-native-unistyles";

type AppFieldErrorProps = {
  children?: React.ReactNode;
};
export function AppFieldError({ children }: AppFieldErrorProps) {
  return <AppText style={styles.errorText}>{children}</AppText>;
}

const styles = StyleSheet.create((theme) => ({
  errorText: {
    color: theme.colors.destructive,
    ...theme.typography.caption,
  },
}));
