import { AppText } from "@/components/ui/app-text";
import { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";
import { useI18n } from "@/i18n";
import { Pressable, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryCategoryChipsProps = {
  categories: AssetCategoryEntity[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
};

export function GalleryCategoryChips({
  categories,
  activeId,
  onSelect,
}: GalleryCategoryChipsProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {/* "All" chip */}
      <Pressable
        onPress={() => onSelect(null)}
        style={[
          styles.chip,
          {
            backgroundColor:
              activeId === null
                ? theme.colors.foreground
                : theme.colors.secondary,
          },
        ]}
      >
        <AppText
          style={[
            styles.chipLabel,
            {
              color:
                activeId === null
                  ? theme.colors.background
                  : theme.colors.foreground,
            },
          ]}
        >
          {t("category.all")}
        </AppText>
      </Pressable>

      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme.colors.foreground
                  : theme.colors.secondary,
              },
            ]}
          >
            <AppText
              style={[
                styles.chipLabel,
                {
                  color: isActive
                    ? theme.colors.background
                    : theme.colors.foreground,
                },
              ]}
            >
              {cat.name}
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
    paddingBottom: theme.spacing.sm,
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
