import * as icons from "lucide-react-native";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import { useTheme } from "@/theme/theme-context";

type IconName = keyof typeof icons;

type AppIconProps = {
  icon: IconName;
  size?: number;
  color?: string;
} & Omit<LucideProps, "color" | "size">;

export function AppIcon({ icon, size = 24, color, ...rest }: AppIconProps) {
  const { theme } = useTheme();
  const IconComponent = icons[icon] as LucideIcon;

  return (
    <IconComponent {...rest} size={size} color={color ?? theme.foreground} />
  );
}

export type { IconName };
