import Icon, { IconName } from "@/components/ui/icon";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type BackgroundedIconProps = {
  icon: IconName;
  iconColor: string;
  iconBackgroundOpacity?: number;
  size?: number;
};

export function BackgroundedIcon({
  icon,
  iconColor,
  iconBackgroundOpacity = 0.14,
  size = 24,
}: BackgroundedIconProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.iconBackground,
        {
          backgroundColor: theme.utils.withOpacity(
            iconColor,
            iconBackgroundOpacity,
          ),
        },
      ]}
    >
      <Icon name={icon} color={iconColor} size={size} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  iconBackground: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
}));
