import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { AppToggle } from "@/components/ui/app-toggle";
import {
  DEFAULT_STATION_FILTERS,
  StationFilters,
} from "@/features/station/types/station-query";
import { useI18n } from "@/i18n";
import { Star } from "lucide-react-native/icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type StationFilterSheetPayload = {
  initial: StationFilters;
  onApply: (next: StationFilters) => void;
};

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export default function StationFilterSheet({
  sheetId,
  payload,
}: SheetProps<"station-filter-sheet">) {
  const { theme } = useUnistyles();
  const { t } = useI18n("station");

  const [local, setLocal] = useState<StationFilters>(
    payload?.initial ?? { ...DEFAULT_STATION_FILTERS },
  );

  // Re-sync if the sheet is reopened with different initial filters
  useEffect(() => {
    if (payload?.initial) setLocal(payload.initial);
  }, [payload?.initial]);

  const setMin = (n: number | null) => {
    setLocal((s) => {
      const min = n;
      // Clamp max ≥ min
      const max = s.ratingMax != null && min != null && s.ratingMax < min
        ? min
        : s.ratingMax;
      return { ...s, ratingMin: min, ratingMax: max };
    });
  };

  const setMax = (n: number | null) => {
    setLocal((s) => {
      const max = n;
      const min = s.ratingMin != null && max != null && s.ratingMin > max
        ? max
        : s.ratingMin;
      return { ...s, ratingMax: max, ratingMin: min };
    });
  };

  const apply = () => {
    payload?.onApply(local);
    SheetManager.hide(sheetId);
  };

  const reset = () => {
    setLocal({ ...DEFAULT_STATION_FILTERS });
  };

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={[
        styles.container,
        { backgroundColor: theme.colors.card },
      ]}
      indicatorStyle={{ backgroundColor: theme.colors.border }}
      gestureEnabled
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={[styles.sheetTitle, { color: theme.colors.foreground }]}>
          {t("filters.title")}
        </AppText>

        {/* Rating range */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
            {t("filters.ratingRange")}
          </AppText>

          <View style={styles.rangeRow}>
            <AppText
              style={[styles.rangeLabel, { color: theme.colors.mutedForeground }]}
            >
              {t("filters.ratingMin")}
            </AppText>
            <View style={styles.chips}>
              {RATING_VALUES.map((n) => (
                <RatingChip
                  key={`min-${n}`}
                  value={n}
                  active={local.ratingMin === n}
                  onPress={() =>
                    setMin(local.ratingMin === n ? null : n)
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.rangeRow}>
            <AppText
              style={[styles.rangeLabel, { color: theme.colors.mutedForeground }]}
            >
              {t("filters.ratingMax")}
            </AppText>
            <View style={styles.chips}>
              {RATING_VALUES.map((n) => (
                <RatingChip
                  key={`max-${n}`}
                  value={n}
                  active={local.ratingMax === n}
                  onPress={() =>
                    setMax(local.ratingMax === n ? null : n)
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.toggleRow}>
            <AppText style={[styles.toggleLabel, { color: theme.colors.foreground }]}>
              {t("filters.includeUnrated")}
            </AppText>
            <AppToggle
              value={local.includeUnrated}
              onValueChange={(v) =>
                setLocal((s) => ({ ...s, includeUnrated: v }))
              }
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Booleans */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <AppText style={[styles.toggleLabel, { color: theme.colors.foreground }]}>
              {t("filters.favoritesOnly")}
            </AppText>
            <AppToggle
              value={local.favoritesOnly}
              onValueChange={(v) =>
                setLocal((s) => ({ ...s, favoritesOnly: v }))
              }
            />
          </View>

          <View style={styles.toggleRow}>
            <AppText style={[styles.toggleLabel, { color: theme.colors.foreground }]}>
              {t("filters.withMediaOnly")}
            </AppText>
            <AppToggle
              value={local.withMediaOnly}
              onValueChange={(v) =>
                setLocal((s) => ({ ...s, withMediaOnly: v }))
              }
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: theme.colors.border },
        ]}
      >
        <View style={styles.footerLeft}>
          <AppButton variant="ghost" size="md" onPress={reset}>
            {t("filters.reset")}
          </AppButton>
        </View>
        <View style={styles.footerRight}>
          <AppButton variant="primary" size="md" onPress={apply}>
            {t("filters.apply")}
          </AppButton>
        </View>
      </View>
    </ActionSheet>
  );
}

function RatingChip({
  value,
  active,
  onPress,
}: {
  value: number;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active
            ? theme.colors.primary
            : "transparent",
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Star
        size={12}
        color={active ? theme.colors.primaryForeground : theme.colors.mutedForeground}
        fill={active ? theme.colors.primaryForeground : "transparent"}
      />
      <AppText
        style={[
          styles.chipText,
          {
            color: active
              ? theme.colors.primaryForeground
              : theme.colors.foreground,
          },
        ]}
      >
        {value}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  scroll: {
    maxHeight: 540,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sheetTitle: {
    ...theme.typography.heading4,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xxs,
  },
  rangeRow: {
    gap: theme.spacing.xs,
  },
  rangeLabel: {
    ...theme.typography.caption,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    minWidth: 48,
    justifyContent: "center",
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.xs,
  },
  toggleLabel: {
    ...theme.typography.rowLabel,
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  divider: {
    height: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    gap: theme.spacing.sm,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
}));
