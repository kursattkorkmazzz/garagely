import { AppText } from "@/components/ui/app-text";
import { StyleSheet } from "react-native-unistyles";

type AppFieldDescriptionProps = {
  children?: React.ReactNode;
};
export function AppFieldDescription({ children }: AppFieldDescriptionProps) {
  return <AppText style={styles.description}>{children}</AppText>;
}

const styles = StyleSheet.create((theme) => ({
  description: {
    ...theme.typography.caption,
    color: theme.colors.mutedForeground,
  },
}));
