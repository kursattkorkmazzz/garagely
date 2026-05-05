import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { StationListItem } from "@/features/station/components/StationListItem";
import { useI18n } from "@/i18n";
import { useStationStore } from "@/stores/station.store";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function StationListScreen() {
  const { t } = useI18n("station");
  const stations = useStationStore((s) => s.stations);
  const typeFilter = useStationStore((s) => s.typeFilter);
  const isLoading = useStationStore((s) => s.isLoading);
  const load = useStationStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    if (!typeFilter) return stations;
    return stations.filter((s) => s.type === typeFilter);
  }, [stations, typeFilter]);

  const openDetail = (id: string) => {
    router.push({ pathname: "/garage/station/[id]", params: { id } });
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StationListItem station={item} onPress={openDetail} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : styles.container
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Icon name="MapPin" size={48} color="#A8A29E" />
              <AppText style={styles.emptyTitle}>{t("noStations")}</AppText>
              <AppText style={styles.emptySub}>{t("noStationsSub")}</AppText>
            </View>
          )
        }
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.heading4,
    color: theme.colors.foreground,
    marginTop: theme.spacing.sm,
  },
  emptySub: {
    ...theme.typography.bodySmall,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
}));
