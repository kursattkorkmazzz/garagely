import Icon, { IconName } from "@/components/ui/icon";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type BackgroundedIconProps = {
  icon: IconName;
  iconColor: string;
  size?: number;
};

export function BackgroundedIcon({
  icon,
  iconColor,
  size = 18,
}: BackgroundedIconProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.iconBackground,
        {
          backgroundColor: theme.utils.withOpacity(iconColor, 0.14),
        },
      ]}
    >
      <Icon name={icon} color={iconColor} size={size} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  iconBackground: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
}));
