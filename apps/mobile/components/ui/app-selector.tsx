import { StyleSheet } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import { spacing } from "@/theme/tokens/spacing";

type AppSelectorProps = {
  value?: string;
  placeholder?: string;
  onPress?: () => void;
};

export function AppSelector({ value, placeholder, onPress }: AppSelectorProps) {
  const { theme } = useTheme();

  const displayText = value || placeholder || "";

  return (
    <AppButton variant="ghost" style={styles.selector} onPress={onPress}>
      <AppText
        variant="bodyMedium"
        style={[styles.text, !value && { color: theme.mutedForeground }]}
      >
        {displayText}
      </AppText>
      <AppIcon icon="ChevronDown" size={18} color={theme.foreground} />
    </AppButton>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  text: {
    fontWeight: "600",
  },
});
