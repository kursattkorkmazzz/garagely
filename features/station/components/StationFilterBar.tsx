import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppText } from "@/components/ui/app-text";
import {
  ALL_STATION_SORTS,
  countActiveFilters,
  StationSortKey,
} from "@/features/station/types/station-query";
import { useI18n } from "@/i18n";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react-native/icons";
import { Pressable, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useStationStore } from "@/stores/station.store";

const FILTER_SHEET_ID = "station-filter-sheet";
const SORT_SHEET_ID = "select-sheet";

export function StationFilterBar() {
  const { theme } = useUnistyles();
  const { t } = useI18n("station");

  const filters = useStationStore((s) => s.filters);
  const sort = useStationStore((s) => s.sort);
  const setFilters = useStationStore((s) => s.setFilters);
  const setSort = useStationStore((s) => s.setSort);

  const activeCount = countActiveFilters(filters);

  const openFilters = () => {
    SheetManager.show(FILTER_SHEET_ID, {
      payload: {
        initial: filters,
        onApply: (next) => {
          // Replace fields one-by-one via setFilters so route-driven `type`
          // is preserved (sheet doesn't expose `type`).
          const { type: _ignored, ...rest } = next;
          void _ignored;
          setFilters(rest);
        },
      },
    });
  };

  const openSort = () => {
    SheetManager.show(SORT_SHEET_ID, {
      payload: {
        ListHeaderComponent: (
          <View style={styles.sortHeader}>
            <AppText
              style={[styles.sortHeaderText, { color: theme.colors.foreground }]}
            >
              {t("sort.title")}
            </AppText>
          </View>
        ),
        sections: [
          {
            data: ALL_STATION_SORTS.map((key) => ({
              key,
              label: t(`sort.${key}` as const),
            })),
          },
        ],
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            selected={sort === (item.key as StationSortKey)}
            onPress={() => {
              setSort(item.key as StationSortKey);
              SheetManager.hide(SORT_SHEET_ID);
            }}
          />
        ),
      },
    });
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={openFilters}
        style={({ pressed }) => [
          styles.btn,
          {
            borderColor: theme.colors.border,
            borderRadius: theme.radius.full,
            backgroundColor: pressed
              ? theme.colors.secondary
              : theme.colors.card,
          },
        ]}
      >
        <SlidersHorizontal size={14} color={theme.colors.foreground} />
        <AppText style={[styles.btnText, { color: theme.colors.foreground }]}>
          {t("filters.button")}
        </AppText>
        {activeCount > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <AppText
              style={[
                styles.badgeText,
                { color: theme.colors.primaryForeground },
              ]}
            >
              {activeCount}
            </AppText>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={openSort}
        style={({ pressed }) => [
          styles.btn,
          {
            borderColor: theme.colors.border,
            borderRadius: theme.radius.full,
            backgroundColor: pressed
              ? theme.colors.secondary
              : theme.colors.card,
          },
        ]}
      >
        <ArrowUpDown size={14} color={theme.colors.foreground} />
        <AppText
          numberOfLines={1}
          style={[styles.btnText, { color: theme.colors.foreground }]}
        >
          {t(`sort.${sort}` as const)}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderWidth: 1,
    flexShrink: 1,
  },
  btnText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: "700",
  },
  sortHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  sortHeaderText: {
    ...theme.typography.heading4,
  },
}));
