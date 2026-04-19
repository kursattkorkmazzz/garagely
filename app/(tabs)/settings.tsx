import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { AppSegmented } from "@/components/ui/app-segmented";
import { AppText } from "@/components/ui/app-text";
import { AppToggle } from "@/components/ui/app-toggle";
import { useI18n } from "@/i18n";
import { useUserPreferencesStore } from "@/stores/user-preferences.store";
import Constants from "expo-constants";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const CURRENCY_LABELS: Record<string, string> = {
  TRY: "₺ TRY",
  USD: "$ USD",
  EUR: "€ EUR",
};

const VOLUME_LABELS: Record<string, string> = {
  L: "L / 100 km",
  gal: "MPG",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
};

export default function SettingsPage() {
  const { t } = useI18n("settings");
  const { t: tLang } = useI18n("languages");
  const { t: tCurrency } = useI18n("currency");

  const {
    theme,
    language,
    distanceUnit,
    currency,
    volumeUnit,
    setTheme,
    setDistanceUnit,
  } = useUserPreferencesStore();

  const [autoBackup, setAutoBackup] = useState(true);
  const [syncDevices, setSyncDevices] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  const version =
    (Constants.expoConfig?.version ?? "1.0.0") +
    (Constants.expoConfig?.runtimeVersion
      ? ` (${Constants.expoConfig.runtimeVersion})`
      : "");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero title */}
      <View style={styles.header}>
        <AppText style={styles.title}>{t("title")}</AppText>
        <AppText style={styles.subtitle}>{t("subtitle")}</AppText>
      </View>

      {/* Appearance */}
      <AppListSectionHeader title={t("preferences")} />
      <AppListGroup>
        <AppListItem
          icon="Moon"
          label={t("theme")}
          trailing={
            <AppSegmented
              value={theme}
              onChange={setTheme}
              options={[
                { value: "system", label: t("themeSystem") },
                { value: "light", label: t("themeLight") },
                { value: "dark", label: t("themeDark") },
              ]}
            />
          }
        />
        <AppListItem
          icon="Languages"
          label={t("language")}
          selectedValue={tLang(`${language}.short`)}
          chevron
        />
        <AppListItem
          icon="Ruler"
          label={t("distanceUnit")}
          trailing={
            <AppSegmented
              value={distanceUnit}
              onChange={setDistanceUnit}
              options={[
                { value: "km", label: "km" },
                { value: "mi", label: "mi" },
              ]}
            />
          }
        />
        <AppListItem
          icon="Banknote"
          label={t("currency")}
          selectedValue={CURRENCY_LABELS[currency]}
          chevron
        />
        <AppListItem
          icon="Fuel"
          label={t("volumeUnit")}
          selectedValue={VOLUME_LABELS[volumeUnit]}
          chevron
        />
      </AppListGroup>

      {/* Backup */}
      <AppListSectionHeader title={t("dataGroup")} />
      <AppListGroup>
        <AppListItem
          icon="Cloud"
          label={t("autoBackup")}
          sub={t("autoBackupSub")}
          trailing={
            <AppToggle value={autoBackup} onValueChange={setAutoBackup} />
          }
        />
        <AppListItem
          icon="Download"
          label={t("exportData")}
          sub={t("exportDataSub")}
          chevron
        />
        <AppListItem
          icon="RefreshCw"
          label={t("syncAcrossDevices")}
          trailing={
            <AppToggle value={syncDevices} onValueChange={setSyncDevices} />
          }
        />
      </AppListGroup>

      {/* Privacy */}
      <AppListSectionHeader title={t("privacyGroup")} />
      <AppListGroup>
        <AppListItem
          icon="ShieldCheck"
          label={t("analytics")}
          sub={t("analyticsSub")}
          trailing={
            <AppToggle value={analytics} onValueChange={setAnalytics} />
          }
        />
        <AppListItem
          icon="MapPin"
          label={t("location")}
          selectedValue={t("locationValue")}
          chevron
        />
      </AppListGroup>

      {/* About */}
      <AppListSectionHeader title={t("informations")} />
      <AppListGroup>
        <AppListItem
          icon="MessageCircleCheck"
          label={t("supportAndSuggestions")}
          chevron
        />
        <AppListItem icon="FileText" label={t("termsOfService")} chevron />
        <AppListItem icon="ShieldCheck" label={t("privacyPolicy")} chevron />
      </AppListGroup>

      <AppText style={styles.footer}>
        {t("footerVersion", { build: version })}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md + 2,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: theme.spacing.md,
  },
  footer: {
    ...theme.typography.caption,
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: "center",
    marginTop: theme.spacing.md + 2,
    color: theme.colors.muted,
  },
}));
