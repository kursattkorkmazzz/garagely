import { AppButton } from "@/components/ui/app-button";
import { AppInputAddon } from "@/components/ui/app-input/app-input-addon";
import { AppInputField } from "@/components/ui/app-input/app-input-field";
import { AppInputGroup } from "@/components/ui/app-input/app-input-group";
import { AppText } from "@/components/ui/app-text";
import { AssetErrors } from "@/features/asset/errors/asset.errors";
import { useI18n } from "@/i18n";
import { AppError } from "@/shared/errors/app-error";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryRenameModalProps = {
  visible: boolean;
  currentBaseName: string;
  extension: string;
  onSave: (newBaseName: string) => Promise<void>;
  onClose: () => void;
};

export function GalleryRenameModal({
  visible,
  currentBaseName,
  extension,
  onSave,
  onClose,
}: GalleryRenameModalProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  const [value, setValue] = useState(currentBaseName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string) => {
    setValue(text);
    if (error) setError(null);
  };

  const handleSave = async () => {
    const trimmed = value.trim();

    if (!trimmed) {
      setError(t("rename.errors.empty"));
      return;
    }
    if (trimmed.length > 200) {
      setError(t("rename.errors.tooLong"));
      return;
    }
    if (/[/\\:*?"<>|]/.test(trimmed)) {
      setError(t("rename.errors.invalidChars"));
      return;
    }

    setLoading(true);
    try {
      await onSave(trimmed);
      onClose();
    } catch (err) {
      if (
        err instanceof AppError &&
        err.errorCode === AssetErrors.NAME_ALREADY_EXISTS
      ) {
        setError(t("rename.errors.alreadyExists"));
      } else {
        setError(t("rename.errors.empty"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setValue(currentBaseName);
    setError(null);
    onClose();
  };

  const handleShow = () => {
    setValue(currentBaseName);
    setError(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      onShow={handleShow}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Title */}
          <AppText style={[styles.title, { color: theme.colors.foreground }]}>
            {t("rename.title")}
          </AppText>

          {/* Input: text field + extension suffix */}
          <AppInputGroup error={!!error} style={styles.inputGroup}>
            <AppInputField
              value={value}
              onChangeText={handleChange}
              onSubmitEditing={handleSave}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
              selectTextOnFocus
            />
            {extension ? (
              <AppInputAddon position="right">
                <AppText
                  style={[
                    styles.extensionText,
                    { color: theme.colors.mutedForeground },
                  ]}
                >
                  .{extension}
                </AppText>
              </AppInputAddon>
            ) : null}
          </AppInputGroup>

          {/* Error message */}
          {error ? (
            <AppText
              style={[styles.errorText, { color: theme.colors.destructive }]}
            >
              {error}
            </AppText>
          ) : null}

          {/* Buttons */}
          <View style={styles.buttons}>
            <AppButton
              variant="ghost"
              style={styles.button}
              onPress={handleClose}
              disabled={loading}
            >
              {t("rename.cancel")}
            </AppButton>
            <AppButton
              variant="primary"
              style={styles.button}
              onPress={handleSave}
              disabled={loading}
            >
              {t("rename.save")}
            </AppButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: "85%",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.heading6,
  },
  inputGroup: {
    width: "100%",
  },
  extensionText: {
    ...theme.typography.bodyMedium,
  },
  errorText: {
    ...theme.typography.bodySmall,
    marginTop: -theme.spacing.xs,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  button: {
    minWidth: 80,
  },
}));
