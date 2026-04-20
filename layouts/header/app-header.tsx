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
  RightComponent?: ReactNode;
} & NativeStackHeaderProps;

export const APP_HEADER_HEIGHT = 56;

export function AppHeader({
  title,
  icon,
  iconColor,
  RightComponent,
  goBack,
  ...props
}: AppHeaderProps) {
  const { theme } = useUnistyles();

  const goBackHandler = () => {
    if (props.navigation.canGoBack()) {
      props.navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {goBack && (
        <Pressable style={styles.goBackButton} onPress={goBackHandler}>
          <Icon name="ArrowLeft" size={24} color={theme.colors.primary} />
        </Pressable>
      )}
      {icon && (
        <Icon name={icon} size={24} color={iconColor || theme.colors.primary} />
      )}
      <AppText style={styles.title}>{title}</AppText>

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
  rightComponent: {
    flex: 1,
    alignItems: "flex-end",
  },
}));
