import { AppButton } from "@/components/ui/app-button";
import { AppInputField } from "@/components/ui/app-input/app-input-field";
import { AppInputGroup } from "@/components/ui/app-input/app-input-group";
import { AppText } from "@/components/ui/app-text";
import { MediaFolderErrors } from "@/features/asset/errors/media-folder.errors";
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

type GalleryFolderNameModalProps = {
  visible: boolean;
  /** Modal başlığı — "Yeni Klasör" veya "Yeniden Adlandır" */
  title: string;
  /** Düzenleme modunda doldurulur; oluşturma modunda boş bırakılır */
  initialValue?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
};

export function GalleryFolderNameModal({
  visible,
  title,
  initialValue = "",
  onSave,
  onClose,
}: GalleryFolderNameModalProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string) => {
    setValue(text);
    if (error) setError(null);
  };

  const handleSave = async () => {
    const trimmed = value.trim();

    if (!trimmed) {
      setError(t("folders.errors.invalidName"));
      return;
    }
    if (trimmed.length > 200) {
      setError(t("folders.errors.nameTooLong"));
      return;
    }
    if (/[/\\:*?"<>|]/.test(trimmed)) {
      setError(t("folders.errors.invalidName"));
      return;
    }

    setLoading(true);
    try {
      await onSave(trimmed);
      handleClose();
    } catch (err) {
      if (
        err instanceof AppError &&
        err.errorCode === MediaFolderErrors.NAME_ALREADY_EXISTS
      ) {
        setError(t("folders.errors.nameAlreadyExists"));
      } else {
        setError(t("folders.errors.invalidName"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setValue(initialValue);
    setError(null);
    onClose();
  };

  const handleShow = () => {
    setValue(initialValue);
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
          <AppText style={[styles.title, { color: theme.colors.foreground }]}>
            {title}
          </AppText>

          <AppInputGroup error={!!error} style={styles.inputGroup}>
            <AppInputField
              value={value}
              onChangeText={handleChange}
              onSubmitEditing={handleSave}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="words"
              autoFocus
              selectTextOnFocus
            />
          </AppInputGroup>

          {error ? (
            <AppText
              style={[styles.errorText, { color: theme.colors.destructive }]}
            >
              {error}
            </AppText>
          ) : null}

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
