import Icon, { IconName } from "@/components/ui/icon";
import { useUnistyles } from "react-native-unistyles";

type TabIconProps = {
  name: IconName;
};
export function TabIcon({ name }: TabIconProps) {
  return () => {
    const { theme } = useUnistyles();
    return <Icon name={name} size={24} color={theme.colors.primary} />;
  };
}
