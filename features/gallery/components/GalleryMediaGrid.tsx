import Icon from "@/components/ui/icon";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryMediaGridProps = {
  assets: AssetEntity[];
  isLoadingMore?: boolean;
  isSelecting: boolean;
  selectedIds: Set<string>;
  onPressAsset: (id: string) => void;
  onLongPressAsset: (id: string) => void;
  onSelectAsset: (id: string) => void;
};

const COLUMNS = 3;

export function GalleryMediaGrid({
  assets,
  isLoadingMore,
  isSelecting,
  selectedIds,
  onPressAsset,
  onLongPressAsset,
  onSelectAsset,
}: GalleryMediaGridProps) {
  const { theme } = useUnistyles();
  const screenWidth = Dimensions.get("window").width;
  const itemSize =
    (screenWidth - theme.spacing.md * 2 - theme.spacing.xs * (COLUMNS - 1)) /
    COLUMNS;

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => {
        const isSelected = selectedIds.has(item.id);
        return (
          <Pressable
            onPress={() =>
              isSelecting ? onSelectAsset(item.id) : onPressAsset(item.id)
            }
            onLongPress={() => !isSelecting && onLongPressAsset(item.id)}
            delayLongPress={300}
            style={[styles.item, { width: itemSize, height: itemSize }]}
          >
            <Image
              source={{ uri: item.fullPath }}
              style={{ width: itemSize, height: itemSize }}
              contentFit="cover"
            />
            {/* Seçim modu karartma overlay */}
            {isSelecting && (
              <View
                style={[styles.overlay, isSelected && styles.overlaySelected]}
              />
            )}
            {/* Checkmark */}
            {isSelecting && (
              <View style={styles.checkContainer}>
                {isSelected ? (
                  <Icon
                    name="CircleCheck"
                    size={22}
                    color={theme.colors.primary}
                  />
                ) : (
                  <View
                    style={[
                      styles.emptyCheck,
                      { borderColor: theme.colors.background },
                    ]}
                  />
                )}
              </View>
            )}
          </Pressable>
        );
      }}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color={theme.colors.mutedForeground} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  row: {
    gap: theme.spacing.xs,
  },
  item: {
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  overlaySelected: {
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  checkContainer: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
  emptyCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  footer: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
}));
