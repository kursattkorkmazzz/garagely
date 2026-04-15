import Icon, { IconName } from "@/components/ui/icon";

type TabIconProps = {
  name: IconName;
};
export function TabIcon({ name }: TabIconProps) {
  return () => <Icon name={name} size={24} color="#FF0000" />;
}
