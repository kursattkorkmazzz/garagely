import { AppListItem } from "@/components/list/list-item";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { formatBytes } from "@/features/gallery/utils/format-bytes";
import { FlatList } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryDocumentListProps = {
  assets: AssetEntity[];
  isSelecting: boolean;
  selectedIds: Set<string>;
  onPressAsset: (id: string) => void;
  onLongPressAsset: (id: string) => void;
  onSelectAsset: (id: string) => void;
};

export function GalleryDocumentList({
  assets,
  isSelecting,
  selectedIds,
  onPressAsset,
  onLongPressAsset,
  onSelectAsset,
}: GalleryDocumentListProps) {
  const { theme } = useUnistyles();

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => {
        const isSelected = isSelecting && selectedIds.has(item.id);
        return (
          <AppListItem
            icon={
              isSelecting ? (isSelected ? "CircleCheck" : "Circle") : "FileText"
            }
            iconColor={
              isSelecting
                ? isSelected
                  ? theme.colors.primary
                  : theme.colors.mutedForeground
                : "#6366f1"
            }
            label={item.fullName}
            sub={formatBytes(item.sizeBytes)}
            chevron={!isSelecting}
            onPress={() =>
              isSelecting ? onSelectAsset(item.id) : onPressAsset(item.id)
            }
            onLongPress={() => !isSelecting && onLongPressAsset(item.id)}
            delayLongPress={300}
            style={isSelected ? [styles.selectedRow] : undefined}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  selectedRow: {
    backgroundColor: theme.colors.secondary,
  },
}));
