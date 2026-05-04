import { AppText } from "@/components/ui/app-text";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { Circle, CircleCheck, Folder } from "lucide-react-native/icons";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryFolderGridProps = {
  folders: MediaFolderEntity[];
  onPressFolder: (id: string) => void;
  onLongPressFolder: (id: string) => void;
  isSelecting?: boolean;
  selectedFolderIds?: Set<string>;
  onSelectFolder?: (id: string) => void;
};

const COLUMNS = 3;

export function GalleryFolderGrid({
  folders,
  onPressFolder,
  onLongPressFolder,
  isSelecting = false,
  selectedFolderIds = new Set(),
  onSelectFolder,
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
      renderItem={({ item }) => {
        const isSelected = selectedFolderIds.has(item.id);
        return (
          <Pressable
            onPress={() =>
              isSelecting
                ? onSelectFolder?.(item.id)
                : onPressFolder(item.id)
            }
            onLongPress={() => onLongPressFolder(item.id)}
            delayLongPress={300}
            style={[
              styles.item,
              {
                width: itemSize,
                height: itemSize,
                backgroundColor: isSelected
                  ? theme.colors.primary + "22"
                  : theme.colors.secondary,
                borderRadius: theme.radius.md,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? theme.colors.primary : "transparent",
              },
            ]}
          >
            <View style={styles.iconWrap}>
              <Folder
                size={36}
                color={isSelected ? theme.colors.primary : theme.colors.primary}
              />
            </View>
            <AppText
              style={[styles.name, { color: theme.colors.foreground }]}
              numberOfLines={2}
            >
              {item.name}
            </AppText>
            {/* Seçim modu göstergesi — sağ üst köşe */}
            {isSelecting && (
              <View style={styles.checkBadge}>
                {isSelected ? (
                  <CircleCheck size={18} color={theme.colors.primary} />
                ) : (
                  <Circle size={18} color={theme.colors.mutedForeground} />
                )}
              </View>
            )}
          </Pressable>
        );
      }}
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
  checkBadge: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
}));
