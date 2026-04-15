import * as icons from "lucide-react-native/icons";

export type IconName = keyof typeof icons;
interface IconProps {
  name: IconName;
  color?: string;
  size?: number;
}
export function Icon({ name, color, size }: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon color={color} size={size} />;
}
export default Icon;
