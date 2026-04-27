import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Image } from "expo-image";
import { ActivityIndicator, Dimensions, FlatList, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryMediaGridProps = {
  assets: AssetEntity[];
  isLoadingMore?: boolean;
  onPressAsset: (id: string) => void;
};

const COLUMNS = 3;

export function GalleryMediaGrid({
  assets,
  isLoadingMore,
  onPressAsset,
}: GalleryMediaGridProps) {
  const { theme } = useUnistyles();
  const screenWidth = Dimensions.get("window").width;
  const itemSize = (screenWidth - theme.spacing.md * 2 - theme.spacing.xs * (COLUMNS - 1)) / COLUMNS;

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPressAsset(item.id)}
          style={[styles.item, { width: itemSize, height: itemSize }]}
        >
          <Image
            source={{ uri: item.fullPath }}
            style={{ width: itemSize, height: itemSize }}
            contentFit="cover"
          />
        </Pressable>
      )}
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
  footer: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
}));
