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

  // Get the icon component, fallback to CircleHelp if not found
  const IconComponent = (icons[icon] || icons.CircleHelp) as LucideIcon;

  return (
    <IconComponent
      {...rest}
      size={size}
      color={color ?? theme.foreground}
      strokeWidth={1.5}
    />
  );
}

export type { IconName };
