import { AppText } from "@/components/ui/app-text";
import { ThemeColors } from "@/theme/tokens/colors";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { ToastConfigParams } from "react-native-toast-message";
import { useUnistyles } from "react-native-unistyles";

export type ToastType = "success" | "error" | "warning" | "info";

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: typeof CheckCircle;
    getBackground: (theme: ThemeColors) => string;
    getForeground: (theme: ThemeColors) => string;
  }
> = {
  success: {
    icon: CheckCircle,
    getBackground: (theme) => theme.color.green,
    getForeground: (theme) => theme.color.greenForeground,
  },
  error: {
    icon: XCircle,
    getBackground: (theme) => theme.color.red,
    getForeground: (theme) => theme.color.redForeground,
  },
  warning: {
    icon: AlertTriangle,
    getBackground: (theme) => theme.color.orange,
    getForeground: (theme) => theme.color.orangeForeground,
  },
  info: {
    icon: Info,
    getBackground: (theme) => theme.color.cyan,
    getForeground: (theme) => theme.color.cyanForeground,
  },
};

interface AppToastBaseProps extends ToastConfigParams<any> {
  type: ToastType;
}

export function AppToastBase({ type, text1, text2 }: AppToastBaseProps) {
  const { theme } = useUnistyles();
  const config = TOAST_CONFIG[type];

  const background = config.getBackground(theme.colors);
  const foreground = config.getForeground(theme.colors);
  const Icon = config.icon;

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: background,
      borderWidth: 1,
      borderColor: theme.utils.withOpacity(foreground, 0.2),
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginHorizontal: spacing.md,
      gap: spacing.sm,
    },
    textContainer: {
      flex: 1,
    },
    text1: {
      color: foreground,
      fontWeight: "500",
    },
    text2: {
      color: theme.utils.withOpacity(foreground, 0.8),
    },
  });

  return (
    <View style={styles.container}>
      <Icon size={20} color={foreground} />
      <View style={styles.textContainer}>
        <AppText style={styles.text1}>{text1}</AppText>
        {text2 && <AppText style={styles.text2}>{text2}</AppText>}
      </View>
    </View>
  );
}
