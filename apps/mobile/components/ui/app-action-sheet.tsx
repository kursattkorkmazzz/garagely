import React from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { AppText } from "./app-text";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import { useI18n } from "@/hooks/use-i18n";

export type ActionSheetOption = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type AppActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
};

export function AppActionSheet({
  visible,
  onClose,
  title,
  message,
  options,
  cancelLabel,
}: AppActionSheetProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();

  const _cancelLabel = cancelLabel || t("common:buttons.cancel");

  const handleOptionPress = (option: ActionSheetOption) => {
    onClose();
    // Small delay to allow modal to close before action
    setTimeout(() => {
      option.onPress();
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.overlay,
            { backgroundColor: withOpacity("#000000", 0.5) },
          ]}
        >
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Options Group */}
              <View
                style={[
                  styles.optionsGroup,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                {/* Header */}
                {(title || message) && (
                  <View
                    style={[styles.header, { borderBottomColor: theme.border }]}
                  >
                    {title && (
                      <AppText
                        variant="bodySmall"
                        color="muted"
                        style={styles.title}
                      >
                        {title}
                      </AppText>
                    )}
                    {message && (
                      <AppText variant="caption" color="muted">
                        {message}
                      </AppText>
                    )}
                  </View>
                )}

                {/* Options */}
                {options.map((option, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleOptionPress(option)}
                    style={({ pressed }) => [
                      styles.option,
                      index < options.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.border,
                      },
                      pressed && {
                        backgroundColor: withOpacity(theme.muted, 0.1),
                      },
                    ]}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={[
                        styles.optionText,
                        option.destructive && { color: theme.destructive },
                      ]}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                ))}
              </View>

              {/* Cancel Button */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  pressed && { backgroundColor: withOpacity(theme.muted, 0.1) },
                ]}
              >
                <AppText
                  variant="bodyMedium"
                  style={[styles.cancelText, { color: theme.primary }]}
                >
                  {_cancelLabel}
                </AppText>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionsGroup: {
    borderRadius: radius * 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    padding: spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  option: {
    padding: spacing.md,
    alignItems: "center",
  },
  optionText: {
    fontWeight: "500",
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: "center",
    borderRadius: radius * 2,
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: "600",
  },
});
