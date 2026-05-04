import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldError } from "@/components/ui/app-field/app-field-error";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
} from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Modal, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppColorPicker } from "./app-color-picker";
import type { ColorPickerRef } from "reanimated-color-picker";

const HEX_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

type AppColorPickerFieldProps = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  error?: string;
  opacityEnabled?: boolean;
};

export function AppColorPickerField({
  label,
  value,
  onChange,
  error,
  opacityEnabled = false,
}: AppColorPickerFieldProps) {
  const { t } = useI18n("components");
  const { theme } = useUnistyles();
  const [isOpen, setIsOpen] = useState(false);
  const [hexText, setHexText] = useState(value);
  const pickerRef = useRef<ColorPickerRef | null>(null);

  const openModal = () => {
    setHexText(value);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (!HEX_REGEX.test(hexText)) {
      setHexText(value);
      onChange(value);
    }
    setIsOpen(false);
  };

  const handlePickerChange = (hex: string) => {
    setHexText(hex.toUpperCase());
    onChange(hex);
  };

  const handleTextChange = (text: string) => {
    const upper = text.toUpperCase();
    setHexText(upper);
    onChange(upper);
    if (HEX_REGEX.test(upper)) {
      pickerRef.current?.setColor(upper, 300);
    }
  };

  const isError = !!error;

  return (
    <AppField>
      <AppFieldLabel>{label}</AppFieldLabel>
      <AppInputGroup error={isError}>
        <AppInputAddon position="left">
          <Pressable onPress={openModal}>
            <View
              style={[styles.swatch, { backgroundColor: HEX_REGEX.test(value) ? value : theme.colors.muted }]}
            />
          </Pressable>
        </AppInputAddon>
        <AppInputField
          value={hexText}
          onChangeText={handleTextChange}
          onFocus={openModal}
          placeholder="#RRGGBB"
          autoCapitalize="characters"
          maxLength={9}
        />
      </AppInputGroup>
      {error ? <AppFieldError>{error}</AppFieldError> : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <GestureHandlerRootView style={styles.gestureRoot}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <AppText style={styles.modalTitle}>{t("colorPicker.title")}</AppText>

            <AppColorPicker
              value={HEX_REGEX.test(value) ? value : "#FFFFFF"}
              onChange={handlePickerChange}
              onComplete={handlePickerChange}
              opacityEnabled={opacityEnabled}
              pickerRef={pickerRef as React.RefObject<ColorPickerRef | null>}
            />

            <AppButton
              variant="primary"
              size="md"
              onPress={closeModal}
              style={styles.doneButton}
            >
              {t("colorPicker.done")}
            </AppButton>
          </Pressable>
        </Pressable>
        </GestureHandlerRootView>
      </Modal>
    </AppField>
  );
}

const styles = StyleSheet.create((theme) => ({
  swatch: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gestureRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.heading4,
    color: theme.colors.foreground,
    textAlign: "center",
  },
  doneButton: {
    marginTop: theme.spacing.xs,
  },
}));
