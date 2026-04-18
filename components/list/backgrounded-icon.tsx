import Icon, { IconName } from "@/components/ui/icon";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type BackgroundedIconProps = {
  icon: IconName;
  iconColor: string;
};
export function BackgroundedIcon(props: BackgroundedIconProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.iconBackground,
        {
          backgroundColor: theme.utils.withOpacity(props.iconColor, 0.1),
        },
      ]}
    >
      <Icon name={props.icon} color={props.iconColor} size={24} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  iconBackground: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
}));
