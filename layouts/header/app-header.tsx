import { AppText } from "@/components/ui/app-text";
import Icon, { IconName } from "@/components/ui/icon";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppHeaderProps = {
  title: string;
  icon?: IconName;
  goBack?: {
    canGoBack: boolean;
    goBack: () => void;
  };
};

export function AppHeader({ title, icon, goBack }: AppHeaderProps) {
  const { theme } = useUnistyles();

  const goBackHandler = () => {
    if (goBack?.canGoBack) {
      goBack.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {goBack?.canGoBack && (
        <Pressable style={styles.goBackButton} onPress={goBackHandler}>
          <Icon name="ArrowLeft" size={24} color={theme.colors.primary} />
        </Pressable>
      )}
      {icon && <Icon name={icon} size={24} color={theme.colors.primary} />}
      <AppText style={styles.title}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.heading3,
    color: theme.colors.foreground,
  },
  goBackButton: {
    padding: theme.spacing.sm,
  },
}));
