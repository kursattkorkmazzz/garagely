import Icon, { IconName } from "@/components/ui/icon";
import { useTheme } from "@/theme/hooks/use-theme";

type TabIconProps = {
  name: IconName;
};
export function TabIcon({ name }: TabIconProps) {
  const { theme } = useTheme();
  return () => <Icon name={name} size={24} color={theme.primary} />;
}
