import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppModal, AppModalFooter } from "@/components/ui/app-modal";
import { AppInput, InputField, InputRightAction } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";

type ChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  isLoading?: boolean;
};

export function ChangePasswordModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: ChangePasswordModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = t("profile.changePassword.errors.currentPasswordRequired");
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = t("profile.changePassword.errors.newPasswordRequired");
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t("profile.changePassword.errors.passwordTooShort");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("profile.changePassword.errors.confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("profile.changePassword.errors.passwordsMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      currentPassword,
      newPassword,
    });

    resetForm();
  };

  return (
    <AppModal
      visible={visible}
      onClose={handleClose}
      title={t("profile.changePassword.title")}
      closeOnBackdrop={!isLoading}
    >
      <View style={styles.form}>
        {/* Current Password */}
        <View style={styles.field}>
          <AppText variant="bodySmall" style={styles.label}>
            {t("profile.changePassword.currentPassword")}
          </AppText>
          <AppInput>
            <InputField
              placeholder={t("profile.changePassword.currentPasswordPlaceholder")}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <InputRightAction>
              <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <AppIcon
                  icon={showCurrentPassword ? "EyeOff" : "Eye"}
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>
            </InputRightAction>
          </AppInput>
          {errors.currentPassword && (
            <AppText variant="caption" style={[styles.error, { color: theme.destructive }]}>
              {errors.currentPassword}
            </AppText>
          )}
        </View>

        {/* New Password */}
        <View style={styles.field}>
          <AppText variant="bodySmall" style={styles.label}>
            {t("profile.changePassword.newPassword")}
          </AppText>
          <AppInput>
            <InputField
              placeholder={t("profile.changePassword.newPasswordPlaceholder")}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <InputRightAction>
              <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                <AppIcon
                  icon={showNewPassword ? "EyeOff" : "Eye"}
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>
            </InputRightAction>
          </AppInput>
          {errors.newPassword && (
            <AppText variant="caption" style={[styles.error, { color: theme.destructive }]}>
              {errors.newPassword}
            </AppText>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.field}>
          <AppText variant="bodySmall" style={styles.label}>
            {t("profile.changePassword.confirmPassword")}
          </AppText>
          <AppInput>
            <InputField
              placeholder={t("profile.changePassword.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <InputRightAction>
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <AppIcon
                  icon={showConfirmPassword ? "EyeOff" : "Eye"}
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>
            </InputRightAction>
          </AppInput>
          {errors.confirmPassword && (
            <AppText variant="caption" style={[styles.error, { color: theme.destructive }]}>
              {errors.confirmPassword}
            </AppText>
          )}
        </View>

        {/* Buttons */}
        <AppModalFooter>
          <AppButton
            variant="primary"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? t("labels.loading") : t("profile.changePassword.changeButton")}
          </AppButton>
          <AppButton
            variant="outline"
            onPress={handleClose}
            disabled={isLoading}
          >
            {t("profile.changePassword.cancelButton")}
          </AppButton>
        </AppModalFooter>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  error: {
    marginLeft: spacing.xs,
  },
});
