import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { Pressable, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TypeFilter = "all" | "media" | "documents";

type GalleryFilterChipsProps = {
  active: TypeFilter;
  onChange: (v: TypeFilter) => void;
};

const FILTERS: { key: TypeFilter; labelKey: string }[] = [
  { key: "all", labelKey: "filters.all" },
  { key: "media", labelKey: "filters.media" },
  { key: "documents", labelKey: "filters.documents" },
];

export function GalleryFilterChips({ active, onChange }: GalleryFilterChipsProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {FILTERS.map((filter) => {
        const isActive = active === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onChange(filter.key)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : theme.colors.secondary,
              },
            ]}
          >
            <AppText
              style={[
                styles.chipLabel,
                {
                  color: isActive
                    ? theme.colors.primaryForeground
                    : theme.colors.foreground,
                },
              ]}
            >
              {t(filter.labelKey as Parameters<typeof t>[0])}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
  },
  chipLabel: {
    ...theme.typography.label,
  },
}));
