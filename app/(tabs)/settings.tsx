// Settings — Variant 1 (Modern Minimal)
// iOS tarzı gruplu liste. Tüm ikonlar rose tint; hiyerarşi tipografi + spacing ile.

import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { AppBadge } from "@/components/ui/app-badge";
import { AppSegmented } from "@/components/ui/app-segmented";
import { AppText } from "@/components/ui/app-text";
import { AppToggle } from "@/components/ui/app-toggle";
import { useI18n } from "@/i18n";
import Constants from "expo-constants";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

type ThemeValue = "light" | "dark" | "system";
type DistanceUnit = "km" | "mi";

export default function SettingsPage() {
  const { t } = useI18n("settings");

  const [themeMode, setThemeMode] = useState<ThemeValue>(
    (UnistylesRuntime.themeName as ThemeValue) ?? "dark",
  );
  const [distance, setDistance] = useState<DistanceUnit>("km");
  const [autoBackup, setAutoBackup] = useState(true);
  const [syncDevices, setSyncDevices] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  const applyTheme = (next: ThemeValue) => {
    setThemeMode(next);
    if (next !== "system") {
      UnistylesRuntime.setTheme(next);
    }
  };

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
              value={themeMode}
              onChange={applyTheme}
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
          selectedValue="Türkçe"
          chevron
        />
        <AppListItem
          icon="Ruler"
          label={t("distanceUnit")}
          trailing={
            <AppSegmented
              value={distance}
              onChange={setDistance}
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
          selectedValue="₺ TRY"
          chevron
        />
        <AppListItem
          icon="Fuel"
          label={t("volumeUnit")}
          selectedValue="L / 100 km"
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
          icon="Info"
          label={t("version")}
          trailing={<AppBadge tone="success">{version}</AppBadge>}
        />
        <AppListItem
          icon="MessageCircleCheck"
          label={t("supportAndSuggestions")}
          chevron
        />
        <AppListItem icon="FileText" label={t("termsOfService")} chevron />
        <AppListItem icon="ShieldCheck" label={t("privacyPolicy")} chevron />
      </AppListGroup>

      {/* Danger zone */}
      <View style={styles.dangerZone}>
        <AppListGroup>
          <AppListItem icon="LogOut" iconColor="#78716C" label={t("signOut")} />
          <AppListItem icon="Trash2" label={t("deleteAccount")} destructive />
        </AppListGroup>
      </View>

      <AppText style={styles.footer}>
        {t("footerBuild", { build: "284" })}
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
    paddingHorizontal: theme.spacing.md + theme.spacing.xs, // 20
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
