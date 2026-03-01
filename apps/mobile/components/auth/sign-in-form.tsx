import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Formik } from "formik";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import {
  loginPayloadValidator,
  type LoginPayload,
} from "@garagely/shared/payloads/auth";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import {
  AppInput,
  InputField,
  InputLeftAction,
  InputRightAction,
} from "@/components/ui/app-input";
import { appToast } from "@/components/ui/app-toast";
import { useStore } from "@/stores";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";
import { useRouter } from "expo-router";

const initialValues: LoginPayload = {
  email: "",
  password: "",
};

export function SignInForm() {
  const { theme } = useTheme();
  const router = useRouter();
  const { login, isLoading } = useStore((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: LoginPayload) => {
    await login(values, {
      onSuccess: () => {
        appToast.success("Welcome back!");
        router.replace("/design-system");
      },
      onError: (message) => {
        appToast.error(message);
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginPayloadValidator}
      onSubmit={handleSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit: formikSubmit,
        values,
        errors,
        touched,
      }) => (
        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.field}>
              <AppText style={styles.label} color="muted">
                EMAIL ADDRESS
              </AppText>
              <AppInput>
                <InputLeftAction>
                  <Mail size={20} color={theme.mutedForeground} />
                </InputLeftAction>
                <InputField
                  placeholder="john@example.com"
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
                PASSWORD
              </AppText>
              <AppInput>
                <InputLeftAction>
                  <Lock size={20} color={theme.mutedForeground} />
                </InputLeftAction>
                <InputField
                  placeholder="••••••••"
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

            <Pressable style={styles.forgotPassword}>
              <AppText style={{ color: theme.primary, fontWeight: "500" }}>
                Forgot Password?
              </AppText>
            </Pressable>
          </View>

          {/* Submit Button */}
          <AppButton
            onPress={() => formikSubmit()}
            style={styles.submitButton}
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
});
