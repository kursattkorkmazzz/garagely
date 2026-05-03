import { AppText } from "@/components/ui/app-text";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { Folder } from "lucide-react-native/icons";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryFolderGridProps = {
  folders: MediaFolderEntity[];
  onPressFolder: (id: string) => void;
  onLongPressFolder: (id: string) => void;
};

const COLUMNS = 3;

export function GalleryFolderGrid({
  folders,
  onPressFolder,
  onLongPressFolder,
}: GalleryFolderGridProps) {
  const { theme } = useUnistyles();
  const screenWidth = Dimensions.get("window").width;
  const itemSize =
    (screenWidth - theme.spacing.md * 2 - theme.spacing.sm * (COLUMNS - 1)) /
    COLUMNS;

  return (
    <FlatList
      data={folders}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPressFolder(item.id)}
          onLongPress={() => onLongPressFolder(item.id)}
          delayLongPress={300}
          style={[
            styles.item,
            {
              width: itemSize,
              height: itemSize,
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <Folder size={36} color={theme.colors.primary} />
          </View>
          <AppText
            style={[styles.name, { color: theme.colors.foreground }]}
            numberOfLines={2}
          >
            {item.name}
          </AppText>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  row: {
    gap: theme.spacing.sm,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    overflow: "hidden",
  },
  iconWrap: {
    marginBottom: theme.spacing.xs,
  },
  name: {
    ...theme.typography.bodySmall,
    textAlign: "center",
  },
}));
