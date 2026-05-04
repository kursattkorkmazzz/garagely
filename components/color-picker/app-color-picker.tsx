import ColorPicker, {
  HueSlider,
  OpacitySlider,
  Panel1,
} from "reanimated-color-picker";
import type { ColorPickerRef } from "reanimated-color-picker";
import { StyleSheet } from "react-native-unistyles";

type AppColorPickerProps = {
  value: string;
  onComplete: (hex: string) => void;
  onChange?: (hex: string) => void;
  opacityEnabled?: boolean;
  pickerRef?: React.RefObject<ColorPickerRef | null>;
};

export function AppColorPicker({
  value,
  onComplete,
  onChange,
  opacityEnabled = false,
  pickerRef,
}: AppColorPickerProps) {
  return (
    <ColorPicker
      ref={pickerRef}
      value={value}
      onCompleteJS={({ hex }) => onComplete(hex)}
      onChangeJS={onChange ? ({ hex }) => onChange(hex) : undefined}
      style={styles.picker}
    >
      <Panel1 style={styles.panel} thumbShape="ring" boundedThumb />
      <HueSlider style={styles.slider} thumbShape="ring" boundedThumb />
      {opacityEnabled && (
        <OpacitySlider style={styles.slider} thumbShape="ring" boundedThumb />
      )}
    </ColorPicker>
  );
}

const styles = StyleSheet.create((theme) => ({
  picker: {
    gap: theme.spacing.md,
  },
  panel: {
    borderRadius: theme.radius.lg,
    height: 200,
  },
  slider: {
    borderRadius: theme.radius.full,
  },
}));
