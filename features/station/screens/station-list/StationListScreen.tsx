import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { StationFilterBar } from "@/features/station/components/StationFilterBar";
import { StationListItem } from "@/features/station/components/StationListItem";
import { hasActiveFilters } from "@/features/station/types/station-query";
import { useI18n } from "@/i18n";
import { useStationStore } from "@/stores/station.store";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export function StationListScreen() {
  const { t } = useI18n("station");
  const { theme } = useUnistyles();
  const stations = useStationStore((s) => s.stations);
  const isLoading = useStationStore((s) => s.isLoading);
  const isLoadingMore = useStationStore((s) => s.isLoadingMore);
  const hasMore = useStationStore((s) => s.hasMore);
  const filters = useStationStore((s) => s.filters);
  const load = useStationStore((s) => s.load);
  const loadMore = useStationStore((s) => s.loadMore);
  const resetFilters = useStationStore((s) => s.resetFilters);

  // Initial load on mount. Filter/sort changes call load() internally
  // (via setFilters/setSort), and create/update/delete also refresh.
  // We don't reload on focus to keep pagination state stable.
  useEffect(() => {
    if (stations.length === 0 && !isLoading) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = (id: string) => {
    router.push({ pathname: "/garage/station/[id]", params: { id } });
  };

  const isEmpty = stations.length === 0;
  const filtersActive = hasActiveFilters(filters);

  return (
    <View style={styles.root}>
      <FlatList
        data={stations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StationListItem station={item} onPress={openDetail} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={<StationFilterBar />}
        contentContainerStyle={
          isEmpty ? styles.emptyContainer : styles.container
        }
        ListEmptyComponent={
          isLoading ? null : filtersActive ? (
            <View style={styles.empty}>
              <Icon name="SearchX" size={48} color={theme.colors.mutedForeground} />
              <AppText style={styles.emptyTitle}>
                {t("filters.emptyFiltered")}
              </AppText>
              <AppText style={styles.emptySub}>
                {t("filters.emptyFilteredSub")}
              </AppText>
              <View style={styles.emptyAction}>
                <AppButton variant="outline" size="sm" onPress={resetFilters}>
                  {t("filters.clearFilters")}
                </AppButton>
              </View>
            </View>
          ) : (
            <View style={styles.empty}>
              <Icon name="MapPin" size={48} color={theme.colors.mutedForeground} />
              <AppText style={styles.emptyTitle}>{t("noStations")}</AppText>
              <AppText style={styles.emptySub}>{t("noStationsSub")}</AppText>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null
        }
        onRefresh={() => void load()}
        refreshing={isLoading && stations.length > 0}
        onEndReached={() => {
          if (hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md + 42 + theme.spacing.md,
  },
  container: {
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.heading4,
    color: theme.colors.foreground,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  emptySub: {
    ...theme.typography.bodySmall,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  emptyAction: {
    marginTop: theme.spacing.sm,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
}));
