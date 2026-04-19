import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { CurrencyTypes, type CurrencyType } from "@/shared/currency";
import { DistanceType, DistanceTypes } from "@/shared/distance";
import { Languages, type Language } from "@/shared/languages";
import { AppThemeType, AppThemeTypes } from "@/shared/theme";
import { VolumeTypes, type VolumeType } from "@/shared/volume";
import { useUserPreferencesStore } from "@/stores/user-preferences.store";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { ScrollView, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet } from "react-native-unistyles";

export default function SettingsPage() {
  const { t } = useI18n("settings");
  const { t: tLang } = useI18n("languages");
  const { t: tCurrency } = useI18n("currency");
  const { t: tUnits } = useI18n("units");
  const { t: tTheme } = useI18n("theme");

  const {
    theme,
    language,
    distanceUnit,
    currency,
    volumeUnit,
    setTheme,
    setLanguage,
    setDistanceUnit,
    setCurrency,
    setVolumeUnit,
  } = useUserPreferencesStore();

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const openThemeSheet = () =>
    SheetManager.show("select-sheet", {
      payload: {
        ListHeaderComponent: (
          <AppText style={styles.sheetTitle}>{t("theme")}</AppText>
        ),
        sections: [
          {
            data: [
              { key: AppThemeTypes.LIGHT, label: tTheme("light") },
              { key: AppThemeTypes.DARK, label: tTheme("dark") },
              { key: AppThemeTypes.SYSTEM, label: tTheme("system") },
            ],
          },
        ],
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            selected={theme === item.key}
            onPress={() => {
              setTheme(item.key as AppThemeType);
              SheetManager.hide("select-sheet");
            }}
          />
        ),
      },
    });

  const openLanguageSheet = () =>
    SheetManager.show("select-sheet", {
      payload: {
        ListHeaderComponent: (
          <AppText style={styles.sheetTitle}>{t("language")}</AppText>
        ),
        sections: [
          {
            data: [
              { key: Languages.TR, label: tLang("tr.long") },
              { key: Languages.EN, label: tLang("en.long") },
            ],
          },
        ],
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            selected={language === item.key}
            onPress={() => {
              setLanguage(item.key as Language);
              SheetManager.hide("select-sheet");
            }}
          />
        ),
      },
    });

  const openCurrencySheet = () =>
    SheetManager.show("select-sheet", {
      payload: {
        ListHeaderComponent: (
          <AppText style={styles.sheetTitle}>{t("currency")}</AppText>
        ),
        sections: [
          {
            data: [
              {
                key: CurrencyTypes.TRY,
                label: tCurrency(`${CurrencyTypes.TRY}.longName`),
              },
              {
                key: CurrencyTypes.USD,
                label: tCurrency(`${CurrencyTypes.USD}.longName`),
              },
              {
                key: CurrencyTypes.EUR,
                label: tCurrency(`${CurrencyTypes.EUR}.longName`),
              },
            ],
          },
        ],
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            selected={currency === item.key}
            onPress={() => {
              setCurrency(item.key as CurrencyType);
              SheetManager.hide("select-sheet");
            }}
          />
        ),
      },
    });

  const openVolumeSheet = () =>
    SheetManager.show("select-sheet", {
      payload: {
        ListHeaderComponent: (
          <AppText style={styles.sheetTitle}>{t("volumeUnit")}</AppText>
        ),
        sections: [
          {
            data: [
              {
                key: VolumeTypes.L,
                label: tUnits(`volume.${VolumeTypes.L}.long`),
              },
              {
                key: VolumeTypes.GAL,
                label: tUnits(`volume.${VolumeTypes.GAL}.long`),
              },
            ],
          },
        ],
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            selected={volumeUnit === item.key}
            onPress={() => {
              setVolumeUnit(item.key as VolumeType);
              SheetManager.hide("select-sheet");
            }}
          />
        ),
      },
    });

  const openDistanceSheet = () =>
    SheetManager.show("select-sheet", {
      payload: {
        ListHeaderComponent: (
          <AppText style={styles.sheetTitle}>{t("distanceUnit")}</AppText>
        ),
        sections: [
          {
            data: [
              {
                key: DistanceTypes.KM,
                label: tUnits(`distance.${DistanceTypes.KM}.long`),
              },
              {
                key: DistanceTypes.MI,
                label: tUnits(`distance.${DistanceTypes.MI}.long`),
              },
            ],
          },
        ],
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            selected={distanceUnit === item.key}
            onPress={() => {
              setDistanceUnit(item.key as DistanceType);
              SheetManager.hide("select-sheet");
            }}
          />
        ),
      },
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/icon.png")}
          contentFit="cover"
          style={styles.image}
        />
        <AppText style={styles.title}>{t("title")}</AppText>
        <AppText style={styles.subtitle}>{t("subtitle")}</AppText>
      </View>

      <AppListSectionHeader title={t("preferences")} />
      <AppListGroup>
        <AppListItem
          icon="Moon"
          label={t("theme")}
          selectedValue={tTheme(theme)}
          chevron
          onPress={openThemeSheet}
        />
        <AppListItem
          icon="Languages"
          label={t("language")}
          selectedValue={tLang(`${language}.long`)}
          chevron
          onPress={openLanguageSheet}
        />
        <AppListItem
          icon="Banknote"
          label={t("currency")}
          selectedValue={tCurrency(`${currency}.longName`)}
          chevron
          onPress={openCurrencySheet}
        />
        <AppListItem
          icon="Ruler"
          label={t("distanceUnit")}
          selectedValue={tUnits(`distance.${distanceUnit}.long`)}
          chevron
          onPress={openDistanceSheet}
        />
        <AppListItem
          icon="Fuel"
          label={t("volumeUnit")}
          selectedValue={tUnits(`volume.${volumeUnit}.long`)}
          chevron
          onPress={openVolumeSheet}
        />
      </AppListGroup>

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
    paddingVertical: theme.spacing.sm,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md + 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.md,
    alignSelf: "center",
    marginBottom: theme.spacing.md,
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
  sheetTitle: {
    ...theme.typography.rowLabel,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
}));
