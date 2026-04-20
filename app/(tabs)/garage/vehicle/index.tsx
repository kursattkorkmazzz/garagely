import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { VehicleListItem } from "@/features/vehicle/components/VehicleListItem";
import { useAppHeader } from "@/layouts/header/hooks/use-app-header";
import { useVehicleStore } from "@/stores/vehicle.store";
import { router } from "expo-router";
import { useEffect } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function VehicleList() {
  const appHeader = useAppHeader();

  //TODO: Burası saçma oldu. Burada direkt çekeceğiz. Store'ta sürekli tutmak mantıksız.
  const { vehicles, isLoading, load } = useVehicleStore();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    appHeader.setHeaderRight(<VehicleListHeaderRightAction />);
    return () => appHeader.resetHeaderRight();
  }, []);

  const openVehicleForm = (id: string) => {
    router.push({
      pathname: "/garage/vehicle/[id]/vehicle-form",
      params: { id },
    });
  };

  return (
    <FlatList
      data={vehicles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <VehicleListItem vehicle={item} onPress={openVehicleForm} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={vehicles.length === 0 && styles.emptyContainer}
      ListEmptyComponent={isLoading ? null : <EmptyState />}
      style={styles.list}
    />
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Icon name="Car" size={48} color="#A8A29E" />
      <AppText style={styles.emptyTitle}>No vehicles yet</AppText>
      <AppText style={styles.emptySub}>
        Add your first vehicle to get started
      </AppText>
    </View>
  );
}

function VehicleListHeaderRightAction() {
  const { theme } = useUnistyles();

  const createVehicleHandler = () => {
    router.push({
      pathname: "/garage/vehicle/[id]/vehicle-form",
      params: { id: "new" },
    });
  };

  return (
    <AppButton variant="icon" onPress={createVehicleHandler}>
      <Icon name="Plus" size={20} color={theme.colors.primary} />
    </AppButton>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md + 40 + theme.spacing.md,
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
