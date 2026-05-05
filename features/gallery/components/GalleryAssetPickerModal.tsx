import { AppText } from "@/components/ui/app-text";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { AssetService } from "@/features/asset/service/asset.service";
import { MediaFolderService } from "@/features/asset/service/media-folder.service";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { useI18n } from "@/i18n";
import { Image } from "expo-image";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Play,
  X,
} from "lucide-react-native/icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type GalleryAssetPickerFilter =
  | "image"
  | "video"
  | "document"
  | "image-or-video"
  | "image-or-video-or-document";

type GalleryAssetPickerModalProps = {
  visible: boolean;
  title: string;
  onSelect: (asset: AssetEntity) => void;
  onClose: () => void;
  filter?: GalleryAssetPickerFilter; // default: "image"
};

const COLUMN_COUNT = 3;

export function GalleryAssetPickerModal({
  visible,
  title,
  onSelect,
  onClose,
  filter = "image",
}: GalleryAssetPickerModalProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [localPath, setLocalPath] = useState<MediaFolderEntity[]>([]);
  const [subFolders, setSubFolders] = useState<MediaFolderEntity[]>([]);
  const [assets, setAssets] = useState<AssetEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAtRoot = localPath.length === 0;

  const loadContent = async (folderId: string | null) => {
    setIsLoading(true);
    try {
      const [folders, assetList] = await Promise.all([
        folderId
          ? MediaFolderService.getChildren(folderId)
          : MediaFolderService.getRootFolders(),
        AssetService.getByFolder(folderId, 100, 0),
      ]);
      setSubFolders(folders);
      setAssets(
        assetList.filter((a) => {
          if (filter === "image") return a.type === AssetTypes.IMAGE;
          if (filter === "video") return a.type === AssetTypes.VIDEO;
          if (filter === "document") return a.type === AssetTypes.DOCUMENT;
          if (filter === "image-or-video")
            return a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO;
          // image-or-video-or-document
          return (
            a.type === AssetTypes.IMAGE ||
            a.type === AssetTypes.VIDEO ||
            a.type === AssetTypes.DOCUMENT
          );
        }),
      );
      setCurrentFolderId(folderId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setLocalPath([]);
    loadContent(null);
  }, [visible]);

  const navigateInto = async (folder: MediaFolderEntity) => {
    setLocalPath((p) => [...p, folder]);
    await loadContent(folder.id);
  };

  const navigateUp = async () => {
    const newPath = localPath.slice(0, -1);
    setLocalPath(newPath);
    const parentId =
      newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    await loadContent(parentId);
  };

  const handleSelectAsset = (asset: AssetEntity) => {
    onSelect(asset);
    onClose();
  };

  const screenWidth = Dimensions.get("window").width;
  const itemSize = (screenWidth - theme.spacing.md * 2) / COLUMN_COUNT;

  const isEmpty = subFolders.length === 0 && assets.length === 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        {/* ─── Top bar ───────────────────────────────────────────────── */}
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + 8,
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X size={22} color={theme.colors.foreground} />
          </Pressable>
          <AppText
            style={[styles.topTitle, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {title}
          </AppText>
          <View style={styles.topSpacer} />
        </View>

        {/* ─── Breadcrumb ─────────────────────────────────────────────── */}
        <View
          style={[
            styles.breadcrumbBar,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          {!isAtRoot && (
            <Pressable onPress={navigateUp} style={styles.backBtn} hitSlop={8}>
              <ChevronRight
                size={16}
                color={theme.colors.primary}
                style={styles.backIcon}
              />
              <AppText
                style={[styles.backLabel, { color: theme.colors.primary }]}
              >
                {localPath.length >= 2
                  ? localPath[localPath.length - 2].name
                  : t("folders.allFiles")}
              </AppText>
            </Pressable>
          )}
          <AppText
            style={[styles.currentLabel, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {isAtRoot
              ? t("folders.allFiles")
              : localPath[localPath.length - 1].name}
          </AppText>
        </View>

        {/* ─── Content ────────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.mutedForeground} />
          </View>
        ) : isEmpty ? (
          <View style={styles.centered}>
            <AppText style={{ color: theme.colors.mutedForeground }}>
              {t("empty.title")}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={[
              ...subFolders.map((f) => ({ type: "folder" as const, item: f })),
              ...assets.map((a) => ({ type: "asset" as const, item: a })),
            ]}
            keyExtractor={(entry) => entry.item.id}
            numColumns={COLUMN_COUNT}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            renderItem={({ item: entry }) => {
              if (entry.type === "folder") {
                const folder = entry.item as MediaFolderEntity;
                return (
                  <Pressable
                    onPress={() => navigateInto(folder)}
                    style={[
                      styles.folderCell,
                      {
                        width: itemSize,
                        height: itemSize,
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <FolderOpen size={28} color={theme.colors.primary} />
                    <AppText
                      style={[
                        styles.folderName,
                        { color: theme.colors.foreground },
                      ]}
                      numberOfLines={2}
                    >
                      {folder.name}
                    </AppText>
                  </Pressable>
                );
              }

              const asset = entry.item as AssetEntity;
              const isVideo = asset.type === AssetTypes.VIDEO;
              const isDocument = asset.type === AssetTypes.DOCUMENT;
              return (
                <Pressable
                  onPress={() => handleSelectAsset(asset)}
                  style={[
                    styles.assetCell,
                    {
                      width: itemSize,
                      height: itemSize,
                      borderRadius: theme.radius.md,
                      overflow: "hidden",
                      backgroundColor: theme.colors.muted,
                    },
                  ]}
                >
                  {isDocument ? (
                    <View style={styles.videoFallback}>
                      <FileText size={28} color={theme.colors.foreground} />
                      <AppText
                        numberOfLines={2}
                        style={{
                          color: theme.colors.foreground,
                          textAlign: "center",
                          fontSize: 11,
                          paddingHorizontal: 4,
                          marginTop: 4,
                        }}
                      >
                        {asset.fullName}
                      </AppText>
                    </View>
                  ) : !isVideo ? (
                    <Image
                      source={{ uri: asset.fullPath }}
                      style={styles.assetImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.videoFallback}>
                      <Play size={28} color={theme.colors.foreground} />
                    </View>
                  )}
                  {isVideo && (
                    <View style={styles.videoBadge}>
                      <Play size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
  },
  closeBtn: {
    padding: 4,
    width: 30,
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    ...theme.typography.bodyMedium,
    fontWeight: "600",
  },
  topSpacer: {
    width: 30,
  },
  // Breadcrumb
  breadcrumbBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    gap: theme.spacing.xs,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backIcon: {
    transform: [{ rotate: "180deg" }],
  },
  backLabel: {
    ...theme.typography.bodySmall,
  },
  currentLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    flex: 1,
  },
  // List
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  row: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  // Folder cell
  folderCell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  folderName: {
    ...theme.typography.caption,
    textAlign: "center",
  },
  // Asset cell
  assetCell: {
    position: "relative",
  },
  assetImage: {
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Empty / loading
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
}));
