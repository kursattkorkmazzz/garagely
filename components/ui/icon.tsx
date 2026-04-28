import * as icons from "lucide-react-native/icons";
import { ViewStyle } from "react-native";

export type IconName = keyof typeof icons;
interface IconProps {
  name: IconName;
  color?: string;
  size?: number;
  style?: ViewStyle;
}
export function Icon({ name, color, size, style }: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon color={color} size={size} style={style} />;
}
export default Icon;
