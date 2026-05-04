import { AppText } from "@/components/ui/app-text";
import Icon, { IconName } from "@/components/ui/icon";
import { type NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
type AppHeaderProps = {
  title: string;
  icon?: IconName;
  iconColor?: string;
  goBack?: boolean;
  onGoBack?: () => void;
  RightComponent?: ReactNode;
} & NativeStackHeaderProps;

export const APP_HEADER_HEIGHT = 56;

export function AppHeader({
  title,
  icon,
  iconColor,
  RightComponent,
  goBack,
  onGoBack,
  ...props
}: AppHeaderProps) {
  const { theme } = useUnistyles();

  const goBackHandler = () => {
    if (onGoBack) {
      onGoBack();
      return;
    }
    if (props.navigation.canGoBack()) {
      props.navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {goBack && (
          <Pressable style={styles.goBackButton} onPress={goBackHandler}>
            <Icon name="ArrowLeft" size={24} color={theme.colors.primary} />
          </Pressable>
        )}
        {icon && (
          <Icon name={icon} size={24} color={iconColor || theme.colors.primary} />
        )}
        <AppText style={styles.title} numberOfLines={1}>{title}</AppText>
      </View>

      {RightComponent && (
        <View style={styles.rightComponent}>{RightComponent}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    height: APP_HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  title: {
    ...theme.typography.heading3,
    color: theme.colors.foreground,
    flex: 1,
  },
  goBackButton: {
    padding: theme.spacing.sm,
  },
  rightComponent: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
}));
