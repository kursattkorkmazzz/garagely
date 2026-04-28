import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Image } from "expo-image";
import { FlatList, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type GalleryRecentStripProps = {
  assets: AssetEntity[];
  isSelecting: boolean;
  onPressAsset: (id: string) => void;
};

export function GalleryRecentStrip({
  assets,
  isSelecting,
  onPressAsset,
}: GalleryRecentStripProps) {
  if (assets.length === 0) return null;

  return (
    <View
      style={{ opacity: isSelecting ? 0.4 : 1 }}
      pointerEvents={isSelecting ? "none" : "auto"}
    >
      <FlatList
        horizontal
        data={assets}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPressAsset(item.id)}
            style={styles.thumbnail}
          >
            <Image
              source={{ uri: item.fullPath }}
              style={styles.image}
              contentFit="cover"
            />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    flexDirection: "row",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  image: {
    width: 80,
    height: 80,
  },
}));
