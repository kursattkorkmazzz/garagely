import { AppListItem } from "@/components/list/list-item";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { formatBytes } from "@/features/gallery/utils/format-bytes";
import { FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type GalleryDocumentListProps = {
  assets: AssetEntity[];
  onPressAsset: (id: string) => void;
};

export function GalleryDocumentList({
  assets,
  onPressAsset,
}: GalleryDocumentListProps) {
  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <AppListItem
          icon="FileText"
          iconColor="#6366f1"
          label={item.fullName}
          sub={formatBytes(item.sizeBytes)}
          chevron
          onPress={() => onPressAsset(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
}));
