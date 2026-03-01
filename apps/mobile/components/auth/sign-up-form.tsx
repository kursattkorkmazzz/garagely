import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Formik } from "formik";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";
import {
  registerPayloadValidator,
  type RegisterPayload,
} from "@garagely/shared/payloads/auth";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import {
  AppInput,
  InputField,
  InputLeftAction,
  InputRightAction,
} from "@/components/ui/app-input";
import { AppCheckbox } from "@/components/ui/app-checkbox";
import { appToast } from "@/components/ui/app-toast";
import { useStore } from "@/stores";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";
import { useRouter } from "expo-router";

type SignUpFormValues = RegisterPayload & { agreedToTerms: boolean };

const initialValues: SignUpFormValues = {
  fullName: "",
  email: "",
  password: "",
  agreedToTerms: false,
};

export function SignUpForm() {
  const { theme } = useTheme();
  const { t } = useI18n(["common", "auth"]);
  const router = useRouter();
  const { register, isLoading } = useStore((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: SignUpFormValues) => {
    const { agreedToTerms, ...payload } = values;
    await register(payload, {
      onSuccess: () => {
        appToast.success(t("auth:signUp.success"));
        router.replace("/(tabs)");
      },
      onError: (message) => {
        appToast.error(message);
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registerPayloadValidator}
      onSubmit={handleSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit: formikSubmit,
        setFieldValue,
        values,
        errors,
        touched,
      }) => (
        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.field}>
              <AppText style={styles.label} color="muted">
                {t("common:labels.fullName").toUpperCase()}
              </AppText>
              <AppInput>
                <InputLeftAction>
                  <User size={20} color={theme.mutedForeground} />
                </InputLeftAction>
                <InputField
                  placeholder={t("auth:placeholders.fullName")}
                  value={values.fullName}
                  onChangeText={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  autoCapitalize="words"
                />
              </AppInput>
              {touched.fullName && errors.fullName && (
                <AppText style={styles.errorText} color="destructive">
                  {errors.fullName}
                </AppText>
              )}
            </View>

            {/* Email */}
            <View style={styles.field}>
              <AppText style={styles.label} color="muted">
                {t("common:labels.email").toUpperCase()}
              </AppText>
              <AppInput>
                <InputLeftAction>
                  <Mail size={20} color={theme.mutedForeground} />
                </InputLeftAction>
                <InputField
                  placeholder={t("auth:placeholders.email")}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </AppInput>
              {touched.email && errors.email && (
                <AppText style={styles.errorText} color="destructive">
                  {errors.email}
                </AppText>
              )}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <AppText style={styles.label} color="muted">
                {t("common:labels.password").toUpperCase()}
              </AppText>
              <AppInput>
                <InputLeftAction>
                  <Lock size={20} color={theme.mutedForeground} />
                </InputLeftAction>
                <InputField
                  placeholder={t("auth:placeholders.password")}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <InputRightAction>
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <Eye size={20} color={theme.mutedForeground} />
                    ) : (
                      <EyeOff size={20} color={theme.mutedForeground} />
                    )}
                  </Pressable>
                </InputRightAction>
              </AppInput>
              {touched.password && errors.password && (
                <AppText style={styles.errorText} color="destructive">
                  {errors.password}
                </AppText>
              )}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <AppCheckbox
                checked={values.agreedToTerms}
                onChange={(checked) => setFieldValue("agreedToTerms", checked)}
              />
              <AppText style={styles.termsText}>
                <AppText color="muted">{t("auth:signUp.terms.prefix")}</AppText>
                <AppText style={{ color: theme.primary }}>
                  {t("auth:signUp.terms.termsOfService")}
                </AppText>
                <AppText color="muted">{t("auth:signUp.terms.and")}</AppText>
                <AppText style={{ color: theme.primary }}>
                  {t("auth:signUp.terms.privacyPolicy")}
                </AppText>
                <AppText color="muted">{t("auth:signUp.terms.suffix")}</AppText>
              </AppText>
            </View>
          </View>

          {/* Submit Button */}
          <AppButton
            onPress={() => formikSubmit()}
            style={styles.submitButton}
            size="lg"
            disabled={isLoading || !values.agreedToTerms}
          >
            {isLoading ? t("auth:signUp.buttonLoading") : t("auth:signUp.button")}
          </AppButton>
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 12,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
});
