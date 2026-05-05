import {
  MediaPickerLabels,
  useMediaPicker,
} from "@/components/media-picker/use-media-picker";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppText } from "@/components/ui/app-text";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { Image } from "expo-image";
import { ImagePlus, Play, Plus, Star } from "lucide-react-native/icons";
import { useCallback } from "react";
import { Linking, Pressable, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const SHEET_ID = "select-sheet";

export type MediaItem = {
  id: string;
  uri: string;
  type: "image" | "video";
};

export type MediaGalleryLabels = MediaPickerLabels & {
  addMedia: string;
  setCover: string;
  removeMedia: string;
  preview: string;
  coverBadge: string;
  emptyTitle: string;
  emptySub: string;
  itemActionsTitle?: string;
};

export type AppMediaGalleryFieldProps = {
  value: MediaItem[];
  coverAssetId: string | null;
  onChange: (items: MediaItem[], coverAssetId: string | null) => void;
  labels: MediaGalleryLabels;
};

const COLUMN_COUNT = 3;

export function AppMediaGalleryField({
  value,
  coverAssetId,
  onChange,
  labels,
}: AppMediaGalleryFieldProps) {
  const { theme } = useUnistyles();

  const { open, Modal } = useMediaPicker({
    kind: "image-or-video",
    multiple: true,
    labels,
  });

  const handleAdd = useCallback(() => {
    open((assets: AssetEntity[]) => {
      // Yeni eklenenler en başta
      const newItems: MediaItem[] = assets.map((a) => ({
        id: a.id,
        uri: a.fullPath,
        type: a.type === AssetTypes.VIDEO ? "video" : "image",
      }));
      // Mevcutla ID seti üzerinden duplicate filtrele
      const existingIds = new Set(value.map((v) => v.id));
      const merged = [
        ...newItems.filter((n) => !existingIds.has(n.id)),
        ...value,
      ];
      // Cover null'sa, yeni eklenen ilk media cover olur
      const nextCover =
        coverAssetId == null && newItems.length > 0
          ? newItems[0].id
          : coverAssetId;
      onChange(merged, nextCover);
    });
  }, [coverAssetId, onChange, open, value]);

  const handleSetCover = (id: string) => {
    onChange(value, id);
  };

  const handleRemove = (id: string) => {
    const next = value.filter((v) => v.id !== id);
    let nextCover = coverAssetId;
    if (coverAssetId === id) {
      nextCover = next.length > 0 ? next[0].id : null;
    }
    onChange(next, nextCover);
  };

  const handlePreview = (item: MediaItem) => {
    // Bu sürümde minimal — system player / image viewer
    Linking.openURL(item.uri).catch(() => {});
  };

  const showItemActions = (item: MediaItem) => {
    const isCover = item.id === coverAssetId;
    const data: { key: string; label: string }[] = [];
    if (!isCover) data.push({ key: "cover", label: labels.setCover });
    data.push({ key: "preview", label: labels.preview });
    data.push({ key: "remove", label: labels.removeMedia });

    SheetManager.show(SHEET_ID, {
      payload: {
        sections: [{ data }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item: opt }: any) => (
          <SelectItem
            label={opt.label as string}
            onPress={() => {
              SheetManager.hide(SHEET_ID);
              if (opt.key === "cover") handleSetCover(item.id);
              else if (opt.key === "preview") handlePreview(item);
              else if (opt.key === "remove") handleRemove(item.id);
            }}
          />
        ),
      },
    });
  };

  const cover = value.find((v) => v.id === coverAssetId) ?? null;
  const others = value.filter((v) => v.id !== coverAssetId);

  return (
    <View style={styles.container}>
      {/* Cover slot */}
      {cover ? (
        <Pressable
          onPress={() => showItemActions(cover)}
          style={[
            styles.coverBox,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.muted,
            },
          ]}
        >
          {cover.type === "image" ? (
            <Image
              source={{ uri: cover.uri }}
              style={styles.coverImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.videoFallback}>
              <Play size={36} color={theme.colors.foreground} />
            </View>
          )}
          <View
            style={[
              styles.coverBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Star size={12} color={theme.colors.primaryForeground} />
            <AppText
              style={[
                styles.coverBadgeText,
                { color: theme.colors.primaryForeground },
              ]}
            >
              {labels.coverBadge}
            </AppText>
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleAdd}
          style={[
            styles.placeholderBox,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.muted,
            },
          ]}
        >
          <ImagePlus size={32} color={theme.colors.mutedForeground} />
          <AppText style={{ color: theme.colors.mutedForeground }}>
            {labels.emptyTitle}
          </AppText>
          <AppText
            style={[styles.emptySub, { color: theme.colors.mutedForeground }]}
          >
            {labels.emptySub}
          </AppText>
        </Pressable>
      )}

      {/* Grid + Add button */}
      <View style={styles.grid}>
        {others.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => showItemActions(item)}
            style={[
              styles.cell,
              {
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.muted,
              },
            ]}
          >
            {item.type === "image" ? (
              <Image
                source={{ uri: item.uri }}
                style={styles.cellImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.videoFallback}>
                <Play size={24} color={theme.colors.foreground} />
              </View>
            )}
            {item.type === "video" && (
              <View style={styles.videoBadge}>
                <Play size={10} color="#fff" />
              </View>
            )}
          </Pressable>
        ))}

        {value.length > 0 && (
          <Pressable
            onPress={handleAdd}
            style={[
              styles.cell,
              styles.addCell,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Plus size={28} color={theme.colors.mutedForeground} />
            <AppText
              style={[styles.addLabel, { color: theme.colors.mutedForeground }]}
            >
              {labels.addMedia}
            </AppText>
          </Pressable>
        )}
      </View>

      {Modal}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },
  // Cover
  coverBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs + 2,
    borderRadius: theme.radius.full,
  },
  coverBadgeText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  placeholderBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  emptySub: {
    ...theme.typography.caption,
  },
  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  cell: {
    width: `${100 / COLUMN_COUNT - 2}%`,
    aspectRatio: 1,
    overflow: "hidden",
    position: "relative",
  },
  cellImage: {
    width: "100%",
    height: "100%",
  },
  videoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  addCell: {
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addLabel: {
    ...theme.typography.caption,
  },
}));
