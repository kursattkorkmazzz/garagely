import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/theme/theme-context";
import { useI18nContext } from "@/context/i18n-context";
import { useI18n } from "@/hooks/use-i18n";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppBadge } from "@/components/ui/app-badge";
import { AppIcon } from "@/components/ui/app-icon";
import * as Application from "expo-application";
import {
  AppAvatar,
  AppAvatarImage,
  AppAvatarFallback,
  AppAvatarBadge,
} from "@/components/ui/app-avatar";
import {
  AppActionSheet,
  ActionSheetOption,
} from "@/components/ui/app-action-sheet";
import { appToast } from "@/components/ui/app-toast";
import {
  AppSettingsSection,
  AppSettingsItem,
  ChangePasswordModal,
} from "@/components/profile";
import { spacing } from "@/theme/tokens/spacing";

export default function ProfileScreen() {
  const { theme, withOpacity, themePreference, changeTheme } = useTheme();
  const { language, changeLanguage, supportedLanguages } = useI18nContext();
  const { t } = useI18n();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const user = useStore((state) => state.auth.user);
  const logout = useStore((state) => state.auth.logout);
  const { avatar, isUploadingAvatar, uploadAvatar, removeAvatar } = useStore(
    (state) => state.user,
  );

  useEffect(() => {
    console.log("User is changed");
    console.log(user);
    console.log(avatar);
  }, []);

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [showDistanceUnitSheet, setShowDistanceUnitSheet] = useState(false);
  const [showVolumeUnitSheet, setShowVolumeUnitSheet] = useState(false);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const updatePreferences = useStore(
    (state) => state.preferences.updatePreferences,
  );
  const changePassword = useStore((state) => state.auth.changePassword);
  const isAuthLoading = useStore((state) => state.auth.isLoading);

  const handleUploadAvatar = async (uri: string) => {
    await uploadAvatar(uri, {
      onSuccess: () => {
        appToast.success(t("toast.photoUpdated"));
      },
      onError: handleError,
    });
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      appToast.error(t("toast.cameraPermissionRequired"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadAvatar(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      appToast.error(t("toast.galleryPermissionRequired"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleRemoveAvatar = async () => {
    await removeAvatar({
      onSuccess: () => {
        appToast.success(t("toast.photoRemoved"));
      },
      onError: handleError,
    });
  };

  const avatarOptions: ActionSheetOption[] = [
    {
      label: t("profile.actionSheets.takePhoto"),
      onPress: pickImageFromCamera,
    },
    {
      label: t("profile.actionSheets.chooseFromGallery"),
      onPress: pickImageFromGallery,
    },
    ...(avatar
      ? [
          {
            label: t("profile.actionSheets.removePhoto"),
            onPress: handleRemoveAvatar,
            destructive: true,
          },
        ]
      : []),
  ];

  const handleEditAvatar = () => {
    if (isUploadingAvatar) return;
    setShowActionSheet(true);
  };

  // Language options
  const languageOptions: ActionSheetOption[] = supportedLanguages.map(
    (lang) => ({
      label: lang.label,
      onPress: () => changeLanguage(lang.code),
    }),
  );

  const getCurrentLanguageLabel = () => {
    const lang = supportedLanguages.find((l) => l.code === language);
    return lang?.label || "English";
  };

  // Theme options
  const themeOptions: ActionSheetOption[] = [
    {
      label: t("profile.theme.light"),
      onPress: () => changeTheme("light"),
    },
    {
      label: t("profile.theme.dark"),
      onPress: () => changeTheme("dark"),
    },
    {
      label: t("profile.theme.system"),
      onPress: () => changeTheme("system"),
    },
  ];

  const getCurrentThemeLabel = () => {
    switch (themePreference) {
      case "light":
        return t("profile.theme.light");
      case "dark":
        return t("profile.theme.dark");
      case "system":
        return t("profile.theme.system");
      default:
        return t("profile.theme.system");
    }
  };

  // Distance unit options
  const distanceUnits = [
    { id: "km", label: t("profile.distanceUnits.km") },
    { id: "mi", label: t("profile.distanceUnits.mi") },
  ];

  const distanceUnitOptions: ActionSheetOption[] = distanceUnits.map(
    (unit) => ({
      label: unit.label,
      onPress: async () => {
        await updatePreferences({ preferredDistanceUnit: unit.id });
      },
    }),
  );

  const getCurrentDistanceUnitLabel = () => {
    const unitId = user?.preferences?.preferredDistanceUnit;
    const unit = distanceUnits.find((u) => u.id === unitId);
    return unit?.label || t("profile.distanceUnits.km");
  };

  // Volume unit options
  const volumeUnits = [
    { id: "l", label: t("profile.volumeUnits.l") },
    { id: "gal", label: t("profile.volumeUnits.gal") },
  ];

  const volumeUnitOptions: ActionSheetOption[] = volumeUnits.map((unit) => ({
    label: unit.label,
    onPress: async () => {
      await updatePreferences({ preferredVolumeUnit: unit.id });
    },
  }));

  const getCurrentVolumeUnitLabel = () => {
    const unitId = user?.preferences?.preferredVolumeUnit;
    const unit = volumeUnits.find((u) => u.id === unitId);
    return unit?.label || t("profile.volumeUnits.l");
  };

  // Currency options
  const currencies = [
    { id: "usd", label: t("profile.currencies.usd") },
    { id: "eur", label: t("profile.currencies.eur") },
    { id: "gbp", label: t("profile.currencies.gbp") },
    { id: "try", label: t("profile.currencies.try") },
  ];

  const currencyOptions: ActionSheetOption[] = currencies.map((currency) => ({
    label: currency.label,
    onPress: async () => {
      await updatePreferences({ preferredCurrency: currency.id });
    },
  }));

  const getCurrentCurrencyLabel = () => {
    const currencyId = user?.preferences?.preferredCurrency;
    const currency = currencies.find((c) => c.id === currencyId);
    return currency?.label || t("profile.currencies.usd");
  };

  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await changePassword(data, {
      onSuccess: () => {
        setShowChangePasswordModal(false);
        appToast.success(t("toast.passwordChanged"));
      },
      onError: handleError,
    });
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <Pressable onPress={handleEditAvatar} disabled={isUploadingAvatar}>
          <AppAvatar size="xl">
            <AppAvatarImage src={avatar?.url ?? ""} alt={user?.fullName} />
            <AppAvatarFallback fallbackText={user?.fullName} />
            <AppAvatarBadge>
              <AppIcon
                icon={isUploadingAvatar ? "Loader" : "Pencil"}
                size={12}
                color={theme.primaryForeground}
              />
            </AppAvatarBadge>
          </AppAvatar>
        </Pressable>

        <AppText variant="heading3" style={styles.name}>
          {user?.fullName ?? "User"}
        </AppText>
        <AppText variant="bodyMedium" color="muted">
          {user?.email ?? ""}
        </AppText>

        <AppBadge variant="default" style={styles.badge}>
          {t("profile.fleetPlan")}
        </AppBadge>
      </View>

      {/* Subscription */}
      <AppSettingsSection title={t("profile.sections.subscription")}>
        <AppSettingsItem
          icon="Star"
          iconColor="#F59E0B"
          iconBackgroundColor={withOpacity("#F59E0B", 0.15)}
          title={t("profile.settings.managePlan")}
          subtitle={t("profile.settings.nextBilling", { date: "Nov 12, 2023" })}
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* App Settings */}
      <AppSettingsSection title={t("profile.sections.appSettings")}>
        <AppSettingsItem
          icon="Globe"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title={t("profile.settings.language")}
          value={getCurrentLanguageLabel()}
          onPress={() => setShowLanguageSheet(true)}
        />
        <AppSettingsItem
          icon="Moon"
          iconColor="#8B5CF6"
          iconBackgroundColor={withOpacity("#8B5CF6", 0.15)}
          title={t("profile.settings.appearance")}
          value={getCurrentThemeLabel()}
          onPress={() => setShowThemeSheet(true)}
        />
        <AppSettingsItem
          icon="Ruler"
          iconColor="#14B8A6"
          iconBackgroundColor={withOpacity("#14B8A6", 0.15)}
          title={t("profile.settings.distanceUnit")}
          value={getCurrentDistanceUnitLabel()}
          onPress={() => setShowDistanceUnitSheet(true)}
        />
        <AppSettingsItem
          icon="Droplets"
          iconColor="#0EA5E9"
          iconBackgroundColor={withOpacity("#0EA5E9", 0.15)}
          title={t("profile.settings.volumeUnit")}
          value={getCurrentVolumeUnitLabel()}
          onPress={() => setShowVolumeUnitSheet(true)}
        />
        <AppSettingsItem
          icon="CircleDollarSign"
          iconColor="#22C55E"
          iconBackgroundColor={withOpacity("#22C55E", 0.15)}
          title={t("profile.settings.currency")}
          value={getCurrentCurrencyLabel()}
          onPress={() => setShowCurrencySheet(true)}
        />
      </AppSettingsSection>

      {/* Notifications */}
      <AppSettingsSection title={t("profile.sections.notifications")}>
        <AppSettingsItem
          icon="Bell"
          iconColor="#EF4444"
          iconBackgroundColor={withOpacity("#EF4444", 0.15)}
          title={t("profile.settings.pushNotifications")}
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* Security */}
      <AppSettingsSection title={t("profile.sections.security")}>
        <AppSettingsItem
          icon="KeyRound"
          iconColor="#F97316"
          iconBackgroundColor={withOpacity("#F97316", 0.15)}
          title={t("profile.settings.changePassword")}
          onPress={() => setShowChangePasswordModal(true)}
        />
      </AppSettingsSection>

      {/* Data & Privacy */}
      <AppSettingsSection title={t("profile.sections.dataPrivacy")}>
        <AppSettingsItem
          icon="Shield"
          iconColor="#6366F1"
          iconBackgroundColor={withOpacity("#6366F1", 0.15)}
          title={t("profile.settings.privacyPolicy")}
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="BarChart3"
          iconColor="#EC4899"
          iconBackgroundColor={withOpacity("#EC4899", 0.15)}
          title={t("profile.settings.dataUsage")}
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* Support */}
      <AppSettingsSection title={t("profile.sections.support")}>
        <AppSettingsItem
          icon="CircleHelp"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title={t("profile.settings.helpCenter")}
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="MessageSquare"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title={t("profile.settings.contactSupport")}
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* App Version */}
      <AppText
        variant="bodySmall"
        color="muted"
        style={{ marginTop: spacing.sm, textAlign: "center" }}
      >
        {t("profile.version", {
          version: Application.nativeApplicationVersion || "0.0.0",
        })}
      </AppText>

      {/* Sign Out */}
      <AppButton
        variant="ghost"
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        <View style={styles.signOutContent}>
          <AppIcon icon="LogOut" size={18} color={theme.destructive} />
          <AppText style={{ color: theme.destructive, fontWeight: "600" }}>
            {t("profile.signOut")}
          </AppText>
        </View>
      </AppButton>

      {/* Avatar Action Sheet */}
      <AppActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={t("profile.actionSheets.profilePhoto")}
        options={avatarOptions}
      />

      {/* Language Action Sheet */}
      <AppActionSheet
        visible={showLanguageSheet}
        onClose={() => setShowLanguageSheet(false)}
        title={t("profile.actionSheets.selectLanguage")}
        options={languageOptions}
      />

      {/* Theme Action Sheet */}
      <AppActionSheet
        visible={showThemeSheet}
        onClose={() => setShowThemeSheet(false)}
        title={t("profile.actionSheets.selectTheme")}
        options={themeOptions}
      />

      {/* Distance Unit Action Sheet */}
      <AppActionSheet
        visible={showDistanceUnitSheet}
        onClose={() => setShowDistanceUnitSheet(false)}
        title={t("profile.actionSheets.selectDistanceUnit")}
        options={distanceUnitOptions}
      />

      {/* Volume Unit Action Sheet */}
      <AppActionSheet
        visible={showVolumeUnitSheet}
        onClose={() => setShowVolumeUnitSheet(false)}
        title={t("profile.actionSheets.selectVolumeUnit")}
        options={volumeUnitOptions}
      />

      {/* Currency Action Sheet */}
      <AppActionSheet
        visible={showCurrencySheet}
        onClose={() => setShowCurrencySheet(false)}
        title={t("profile.actionSheets.selectCurrency")}
        options={currencyOptions}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handleChangePassword}
        isLoading={isAuthLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  name: {
    marginTop: spacing.md,
  },
  badge: {
    marginTop: spacing.md,
    alignSelf: "center",
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  signOutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
