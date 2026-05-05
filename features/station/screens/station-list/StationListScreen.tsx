import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { StationFilterChips } from "@/features/station/components/StationFilterChips";
import { StationListItem } from "@/features/station/components/StationListItem";
import { useI18n } from "@/i18n";
import { useStationStore } from "@/stores/station.store";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function StationListScreen() {
  const { t } = useI18n("station");
  const { isLoading, load, typeFilter, setTypeFilter, getFiltered } =
    useStationStore();
  const stations = getFiltered();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openDetail = (id: string) => {
    router.push({ pathname: "/garage/station/[id]", params: { id } });
  };

  return (
    <View style={styles.root}>
      <StationFilterChips value={typeFilter} onChange={setTypeFilter} />
      <FlatList
        data={stations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StationListItem station={item} onPress={openDetail} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          stations.length === 0 ? styles.emptyContainer : styles.container
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
    marginLeft: theme.spacing.md + 40 + theme.spacing.md,
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
