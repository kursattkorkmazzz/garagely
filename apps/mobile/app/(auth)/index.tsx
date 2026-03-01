import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Car } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppDivider } from "@/components/ui/app-divider";
import { AppIcon } from "@/components/ui/app-icon";
import {
  AppTabs,
  AppTabList,
  AppTabTrigger,
  AppTabContent,
} from "@/components/ui/app-tabs";
import { appToast } from "@/components/ui/app-toast";
import { SignInForm, SignUpForm } from "@/components/auth";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import { useState } from "react";

export default function AuthScreen() {
  const { theme } = useTheme();
  const { t } = useI18n(["common", "auth"]);
  const [tab, setTab] = useState("signin");

  const handleGoogleSignIn = () => {
    appToast(
      t("common:toast.comingSoon", { feature: t("auth:social.google") }),
    );
  };

  const handleAppleSignIn = () => {
    appToast(t("common:toast.comingSoon", { feature: t("auth:social.apple") }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBox,
              { backgroundColor: theme.secondary, borderRadius: radius * 3 },
            ]}
          >
            <Car size={40} color={theme.primary} />
          </View>
        </View>

        {/* Tabs */}
        <AppTabs defaultValue="signin" value={tab} onValueChange={setTab}>
          {/* Header - Updates based on active tab */}
          <AppTabContent value="signin">
            <View style={styles.header}>
              <AppText variant="heading2" style={styles.title}>
                {t("auth:signIn.title")}
              </AppText>
              <AppText
                variant="bodyMedium"
                color="muted"
                style={styles.subtitle}
              >
                {t("auth:signIn.subtitle")}
              </AppText>
            </View>
          </AppTabContent>

          <AppTabContent value="signup">
            <View style={styles.header}>
              <AppText variant="heading2" style={styles.title}>
                {t("auth:signUp.title")}
              </AppText>
              <AppText
                variant="bodyMedium"
                color="muted"
                style={styles.subtitle}
              >
                {t("auth:signUp.subtitle")}
              </AppText>
            </View>
          </AppTabContent>

          {/* Tab Switcher */}
          <AppTabList style={styles.tabList}>
            <AppTabTrigger value="signin">{t("auth:signIn.tab")}</AppTabTrigger>
            <AppTabTrigger value="signup">{t("auth:signUp.tab")}</AppTabTrigger>
          </AppTabList>

          {/* Forms */}
          <AppTabContent value="signin">
            <SignInForm />
          </AppTabContent>

          <AppTabContent value="signup">
            <SignUpForm />
          </AppTabContent>
        </AppTabs>

        {/* Divider */}
        <AppDivider text={t("auth:orContinueWith")} />

        {/* Social Buttons */}
        <View style={styles.socialButtons}>
          <AppButton
            variant="secondary"
            onPress={handleGoogleSignIn}
            style={styles.socialButton}
          >
            <AppText style={{ fontSize: 20 }}>G</AppText>
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={handleAppleSignIn}
            style={styles.socialButton}
          >
            <AppIcon icon="Apple" size={20} />
          </AppButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoBox: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  tabList: {
    marginBottom: spacing.xl,
  },
  socialButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  socialButton: {
    flex: 1,
  },
});
