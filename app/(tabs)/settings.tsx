import { AppListItem } from "@/components/list/list-item";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { AppText } from "@/components/ui/app-text";
import { IconName } from "@/components/ui/icon";
import { AppSectionList } from "@/components/ui/list/app-section-list";
import { useI18n } from "@/i18n";
import { useMemo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type SettingsSectionItem = {
  title: string;
  data: SettingsListItem[];
};
type SettingsListItem = {
  key: string;
  label: string;
  icon: IconName;
  iconColor: string;
  selectedValue?: string;
};

export default function SettingsPage() {
  const { t: tLang } = useI18n("languages");
  const { t: tSettings } = useI18n("settings");

  const menuData: SettingsSectionItem[] = useMemo(
    () => [
      {
        title: tSettings("preferences"),
        data: [
          {
            key: "theme",
            label: tSettings("theme"),
            icon: "Palette",
            iconColor: "#FF6B6B",
            selectedValue: "Light",
          },
          {
            key: "language",
            label: tSettings("language"),
            icon: "Languages",
            iconColor: "#4ECDC4",
            selectedValue: tLang("EN.short"),
          },
          {
            key: "currency",
            label: tSettings("currency"),
            icon: "Banknote",
            iconColor: "#ffcf0e",
            selectedValue: "USD",
          },
          {
            key: "distance_unit",
            label: tSettings("distanceUnit"),
            icon: "Ruler",
            iconColor: "#6BCB77",
            selectedValue: "Meters",
          },
          {
            key: "volume_unit",
            label: tSettings("volumeUnit"),
            icon: "Droplet",
            iconColor: "#A78BFA",
            selectedValue: "Liters",
          },
        ],
      },
      {
        title: tSettings("informations"),
        data: [
          {
            key: "privacy_policy",
            label: tSettings("privacyPolicy"),
            icon: "ShieldCheck",
            iconColor: "#4ECDC4",
          },
          {
            key: "terms_of_service",
            label: tSettings("termsOfService"),
            icon: "FileText",
            iconColor: "#4ECDC4",
          },
          {
            key: "support_and_suggestions",
            label: tSettings("supportAndSuggestions"),
            icon: "MessageCircleCheck",
            iconColor: "#4ECDC4",
          },
        ],
      },
    ],
    [tSettings, tLang],
  );

  const menuItemClickHandler = (item: SettingsListItem) => {
    console.log("Clicked => ", item.key);
  };
  return (
    <AppSectionList<SettingsListItem, SettingsSectionItem>
      style={styles.listContainer}
      sections={menuData}
      contentContainerStyle={styles.listContentContainer}
      renderItem={({ item }) => {
        return (
          <AppListItem
            onPress={() => menuItemClickHandler(item)}
            icon={item.icon}
            iconColor={item.iconColor}
            label={item.label}
            selectedValue={item.selectedValue}
          />
        );
      }}
      renderSectionHeader={(item) => (
        <AppListSectionHeader title={item.section.title} />
      )}
      keyExtractor={(item) => item.key}
      ListFooterComponent={() => {
        return (
          <View style={styles.footerContainer}>
            <AppText style={styles.versionText}>App Version: 1.0.0</AppText>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  listContentContainer: {
    gap: theme.spacing.sm,
  },
  footerContainer: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  versionText: {
    color: theme.colors.secondary,
  },
}));
