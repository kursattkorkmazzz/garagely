import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Loader2 } from "lucide-react-native";
import { useTheme } from "@/theme/theme-context";

type SpinnerSize = "sm" | "default" | "lg";

type AppSpinnerProps = {
  size?: SpinnerSize;
  color?: string;
};

const sizeValues: Record<SpinnerSize, number> = {
  sm: 16,
  default: 24,
  lg: 32,
};

export function AppSpinner({ size = "default", color }: AppSpinnerProps) {
  const { theme } = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [rotation]);

  const iconSize = sizeValues[size];
  const iconColor = color ?? theme.foreground;

  const animatedStyle = useAnimatedStyle(() => ({
    width: iconSize,
    height: iconSize,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Loader2 size={iconSize} color={iconColor} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
