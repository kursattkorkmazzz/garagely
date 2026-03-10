import { AppIcon, type IconName } from "@/components/ui/app-icon";
import { AppText } from "@/components/ui/app-text";
import { AppView } from "@/components/ui/app-view";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";
import { StyleSheet } from "react-native";

type AppListEmptyProps = {
  icon: IconName;
  title: string;
  description?: string;
};

export function AppListEmpty({ icon, title, description }: AppListEmptyProps) {
  const { theme } = useTheme();

  return (
    <AppView style={styles.container}>
      <AppView
        style={[styles.iconContainer, { backgroundColor: theme.muted }]}
      >
        <AppIcon icon={icon} size={32} color={theme.mutedForeground} />
      </AppView>
      <AppText variant="heading5" style={styles.title}>
        {title}
      </AppText>
      {description && (
        <AppText variant="bodySmall" color="muted" style={styles.description}>
          {description}
        </AppText>
      )}
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: "center",
  },
});
