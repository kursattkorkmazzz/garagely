import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { AppImageViewer, ImageViewerItem } from "@/components/ui/app-image-viewer";
import { AppPdfViewer } from "@/components/ui/app-pdf-viewer";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppButton } from "@/components/ui/app-button";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { MediaFolderErrors } from "@/features/asset/errors/media-folder.errors";
import { formatBytes } from "@/features/gallery/utils/format-bytes";
import { truncateFileName } from "@/features/gallery/utils/truncate-file-name";
import { GalleryBreadcrumb } from "@/features/gallery/components/GalleryBreadcrumb";
import { GalleryDocumentList } from "@/features/gallery/components/GalleryDocumentList";
import { GalleryEmpty } from "@/features/gallery/components/GalleryEmpty";
import { GalleryFilterChips } from "@/features/gallery/components/GalleryFilterChips";
import { GalleryFolderGrid } from "@/features/gallery/components/GalleryFolderGrid";
import { GalleryFolderNameModal } from "@/features/gallery/components/GalleryFolderNameModal";
import { GalleryFolderPickerModal } from "@/features/gallery/components/GalleryFolderPickerModal";
import { GalleryMediaGrid } from "@/features/gallery/components/GalleryMediaGrid";
import { GalleryRenameModal } from "@/features/gallery/components/GalleryRenameModal";
import { GallerySelectionBar } from "@/features/gallery/components/GallerySelectionBar";
import { AppHeader } from "@/layouts/header/app-header";
import { useI18n } from "@/i18n";
import { AppError } from "@/shared/errors/app-error";
import { useGalleryStore } from "@/stores/gallery.store";
import { handleUIError } from "@/utils/handle-ui-error";
import * as DocumentPicker from "expo-document-picker";
import { Stack } from "expo-router";
import { FolderPlus, Upload } from "lucide-react-native/icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export function GalleryScreen() {
  const store = useGalleryStore();
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  const pickedImageState = usePickedImage({
    allowsMultipleSelection: true,
    maxSelectionLimit: 30,
  });

  useEffect(() => {
    store.loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Scroll / Pagination ──────────────────────────────────────────
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
    if (nearEnd) store.loadMore();
  };

  // ─── Upload handlers ──────────────────────────────────────────────
  const handleUploadImage = async () => {
    SheetManager.hide("select-sheet");
    const uris = await pickedImageState.pickImageFromLibrary({
      allowsEditing: false,
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!uris || uris.length === 0) return;
    for (const uri of uris) {
      await store.uploadImage(uri).catch(handleUIError);
    }
  };

  const handleUploadVideo = async () => {
    SheetManager.hide("select-sheet");
    const uris = await pickedImageState.pickImageFromLibrary({
      allowsEditing: false,
      allowsMultipleSelection: false,
      mediaTypes: ["videos"],
    });
    if (!uris || uris.length === 0) return;
    await store.uploadVideo(uris[0]).catch(handleUIError);
  };

  const handleUploadDocument = async () => {
    SheetManager.hide("select-sheet");
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    await store.uploadDocument(result.assets[0].uri).catch(handleUIError);
  };

  const handleUpload = () => {
    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            title: t("uploadSheet.title"),
            data: [
              { key: "image", label: t("uploadSheet.image"), icon: "Image" },
              { key: "video", label: t("uploadSheet.video"), icon: "Video" },
              { key: "document", label: t("uploadSheet.document"), icon: "FileText" },
            ],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            onPress={
              item.key === "image"
                ? handleUploadImage
                : item.key === "video"
                  ? handleUploadVideo
                  : handleUploadDocument
            }
          />
        ),
      },
    });
  };

  // ─── Klasör state'leri ────────────────────────────────────────────
  const [createFolderVisible, setCreateFolderVisible] = useState(false);

  type RenameFolderTarget = { id: string; name: string };
  const [renameFolderTarget, setRenameFolderTarget] =
    useState<RenameFolderTarget | null>(null);

  // folderId taşınacak klasör; null = modal kapalı
  const [moveFolderTarget, setMoveFolderTarget] = useState<string | null>(null);
  // assetId taşınacak asset; null = modal kapalı
  const [moveAssetTarget, setMoveAssetTarget] = useState<string | null>(null);
  // toplu taşıma picker
  const [bulkMovePickerVisible, setBulkMovePickerVisible] = useState(false);

  // ─── Klasör handlers ─────────────────────────────────────────────
  const handleLongPressFolder = (id: string) => {
    const folder = store.subFolders.find((f) => f.id === id);
    if (!folder) return;

    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            data: [
              { key: "select", label: t("itemActions.select"),  icon: "CheckSquare" },
              { key: "rename", label: t("itemActions.rename"),  icon: "Pencil" },
              { key: "move",   label: t("folders.moveFolder"),  icon: "FolderInput" },
              { key: "delete", label: t("itemActions.delete"),  icon: "Trash2" },
            ],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            onPress={() => {
              SheetManager.hide("select-sheet");
              if (item.key === "select") {
                store.enterSelectionMode(id, "folder");
              } else if (item.key === "rename") {
                setRenameFolderTarget({ id, name: folder.name });
              } else if (item.key === "move") {
                setMoveFolderTarget(id);
              } else if (item.key === "delete") {
                handleDeleteFolder(id);
              }
            }}
          />
        ),
      },
    });
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const stats = await store.deleteFolderWithWarning(id);
      const msg =
        stats.folderCount > 0 || stats.assetCount > 0
          ? t("folders.deleteConfirmMessage", {
              folderCount: stats.folderCount,
              assetCount: stats.assetCount,
            })
          : t("folders.deleteConfirmMessageNoChildren");

      Alert.alert(t("folders.deleteConfirmTitle"), msg, [
        { text: t("selection.cancel"), style: "cancel" },
        {
          text: t("selection.delete"),
          style: "destructive",
          onPress: () => store.deleteFolder(id).catch(handleUIError),
        },
      ]);
    } catch (err) {
      handleUIError(err);
    }
  };

  // ─── Image preview ────────────────────────────────────────────────
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // ─── PDF preview ─────────────────────────────────────────────────
  type PdfPreview = { uri: string; label: string; sub: string };
  const [pdfPreview, setPdfPreview] = useState<PdfPreview | null>(null);

  const handlePressDocument = (id: string) => {
    const asset = store.assetsById[id];
    if (!asset) return;
    setPdfPreview({
      uri: asset.fullPath,
      label: truncateFileName(asset.baseName, asset.extension),
      sub: formatBytes(asset.sizeBytes),
    });
  };

  // ─── Asset rename ─────────────────────────────────────────────────
  type RenameTarget = { id: string; baseName: string; extension: string };
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);

  const handlePressMedia = (id: string) => {
    const index = imageAssets.findIndex((a) => a.id === id);
    if (index !== -1) setPreviewIndex(index);
  };

  // ─── Asset seçim modu ─────────────────────────────────────────────
  const handleLongPress = (id: string) => {
    const asset = store.assetsById[id];
    if (!asset) return;

    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            data: [
              { key: "select", label: t("itemActions.select"),  icon: "CheckSquare" },
              { key: "rename", label: t("itemActions.rename"),  icon: "Pencil" },
              { key: "move",   label: t("itemActions.move"),    icon: "FolderInput" },
              { key: "delete", label: t("itemActions.delete"),  icon: "Trash2" },
            ],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            onPress={() => {
              SheetManager.hide("select-sheet");
              if (item.key === "select") {
                store.enterSelectionMode(id);
              } else if (item.key === "rename") {
                setRenameTarget({
                  id,
                  baseName: asset.baseName,
                  extension: asset.extension,
                });
              } else if (item.key === "move") {
                setMoveAssetTarget(id);
              } else if (item.key === "delete") {
                Alert.alert(
                  t("selection.deleteConfirmTitle", { count: 1 }),
                  t("selection.deleteConfirmMessage"),
                  [
                    { text: t("selection.cancel"), style: "cancel" },
                    {
                      text: t("selection.delete"),
                      style: "destructive",
                      onPress: () => {
                        store.enterSelectionMode(id);
                        store.deleteSelected().catch(handleUIError);
                      },
                    },
                  ],
                );
              }
            }}
          />
        ),
      },
    });
  };

  const handleSelect = (id: string) => store.toggleSelection(id);
  const handleSelectFolder = (id: string) => store.toggleFolderSelection(id);

  const totalSelected = store.selectedIds.size + store.selectedFolderIds.size;

  const handleDeleteSelected = () => {
    Alert.alert(
      t("selection.deleteConfirmTitle", { count: totalSelected }),
      t("selection.deleteConfirmMessage"),
      [
        { text: t("selection.cancel"), style: "cancel" },
        {
          text: t("selection.delete"),
          style: "destructive",
          onPress: () => store.deleteSelected().catch(handleUIError),
        },
      ],
    );
  };

  // ─── Bulk move handler ────────────────────────────────────────────
  const handleBulkMove = () => setBulkMovePickerVisible(true);

  const handleBulkMoveSelect = async (targetFolderId: string | null) => {
    setBulkMovePickerVisible(false);
    try {
      await store.moveSelected(targetFolderId);
    } catch (err) {
      if (
        err instanceof AppError &&
        err.errorCode === MediaFolderErrors.CIRCULAR_REFERENCE
      ) {
        Alert.alert("", t("folders.errors.circularReference"));
      } else {
        handleUIError(err);
      }
    }
  };

  // ─── Move asset handler ───────────────────────────────────────────
  const handleMoveAssetSelect = async (targetFolderId: string | null) => {
    if (!moveAssetTarget) return;
    try {
      await store.moveAsset(moveAssetTarget, targetFolderId);
    } catch (err) {
      handleUIError(err);
    }
    setMoveAssetTarget(null);
  };

  // ─── Move folder handler ──────────────────────────────────────────
  const handleMoveFolderSelect = async (targetParentId: string | null) => {
    if (!moveFolderTarget) return;
    try {
      await store.moveFolder(moveFolderTarget, targetParentId);
    } catch (err) {
      if (
        err instanceof AppError &&
        err.errorCode === MediaFolderErrors.CIRCULAR_REFERENCE
      ) {
        Alert.alert("", t("folders.errors.circularReference"));
      } else {
        handleUIError(err);
      }
    }
    setMoveFolderTarget(null);
  };

  // ─── Header geri butonu ───────────────────────────────────────────
  const isInsideFolder = store.folderPath.length > 0;
  const headerTitle = isInsideFolder
    ? store.folderPath[store.folderPath.length - 1].name
    : "Gallery";

  // ─── Veriler ──────────────────────────────────────────────────────
  const filtered = store.getFilteredAssets();
  const mediaAssets = filtered.filter(
    (a) => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO,
  );
  const docAssets = filtered.filter((a) => a.type === AssetTypes.DOCUMENT);
  const imageAssets = mediaAssets.filter((a) => a.type === AssetTypes.IMAGE);
  const viewerImages: ImageViewerItem[] = imageAssets.map((a) => ({
    uri: a.fullPath,
    label: truncateFileName(a.baseName, a.extension),
    sub: formatBytes(a.sizeBytes),
  }));

  const stackScreen = (
    <Stack.Screen
      options={{
        headerShown: true,
        header: (props) => (
          <AppHeader
            title={headerTitle}
            icon={isInsideFolder ? undefined : "FolderOpen"}
            goBack={true}
            onGoBack={
              isInsideFolder ? store.navigateBack : undefined
            }
            RightComponent={
              <View style={styles.headerButtons}>
                <AppButton
                  variant="ghost"
                  size="icon"
                  onPress={() => setCreateFolderVisible(true)}
                >
                  <FolderPlus size={20} color={theme.colors.primary} />
                </AppButton>
                <AppButton variant="ghost" size="icon" onPress={handleUpload}>
                  <Upload size={20} color={theme.colors.primary} />
                </AppButton>
              </View>
            }
            {...props}
          />
        ),
      }}
    />
  );

  if (store.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {stackScreen}
        <ActivityIndicator color={theme.colors.mutedForeground} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {stackScreen}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          store.isSelecting && styles.contentWithBar,
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb navigasyon — sadece klasör içindeyken gösterilir */}
        {isInsideFolder && (
          <GalleryBreadcrumb
            path={store.folderPath}
            onNavigate={store.navigateToFolder}
          />
        )}

        {/* Type filter chips */}
        <GalleryFilterChips
          active={store.activeTypeFilter}
          onChange={store.setTypeFilter}
        />

        {/* Alt klasörler */}
        {store.subFolders.length > 0 && (
          <>
            <AppListSectionHeader title={t("folders.title")} />
            <GalleryFolderGrid
              folders={store.subFolders}
              onPressFolder={(id) => store.navigateToFolder(id)}
              onLongPressFolder={handleLongPressFolder}
              isSelecting={store.isSelecting}
              selectedFolderIds={store.selectedFolderIds}
              onSelectFolder={handleSelectFolder}
            />
          </>
        )}

        {/* Medya grid */}
        {mediaAssets.length > 0 && (
          <>
            <AppListSectionHeader title={t("sections.media")} />
            <GalleryMediaGrid
              assets={mediaAssets}
              isLoadingMore={store.isLoadingMore}
              isSelecting={store.isSelecting}
              selectedIds={store.selectedIds}
              onPressAsset={handlePressMedia}
              onLongPressAsset={handleLongPress}
              onSelectAsset={handleSelect}
            />
          </>
        )}

        {/* Belgeler listesi */}
        {docAssets.length > 0 && (
          <>
            <AppListSectionHeader title={t("sections.documents")} />
            <GalleryDocumentList
              assets={docAssets}
              isSelecting={store.isSelecting}
              selectedIds={store.selectedIds}
              onPressAsset={handlePressDocument}
              onLongPressAsset={handleLongPress}
              onSelectAsset={handleSelect}
            />
          </>
        )}

        {/* Empty state: hiç klasör ve hiç asset yoksa */}
        {store.subFolders.length === 0 && filtered.length === 0 && (
          <GalleryEmpty onUpload={handleUpload} />
        )}
      </ScrollView>

      {/* Seçim action bar */}
      <GallerySelectionBar
        selectedCount={totalSelected}
        onMove={handleBulkMove}
        onDelete={handleDeleteSelected}
        onCancel={store.exitSelectionMode}
      />

      {/* Image preview */}
      <AppImageViewer
        isVisible={previewIndex !== null}
        images={viewerImages}
        initialIndex={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
      />

      {/* PDF preview */}
      <AppPdfViewer
        visible={pdfPreview !== null}
        uri={pdfPreview?.uri ?? ""}
        label={pdfPreview?.label}
        sub={pdfPreview?.sub}
        onClose={() => setPdfPreview(null)}
      />

      {/* Asset rename modal */}
      <GalleryRenameModal
        visible={renameTarget !== null}
        currentBaseName={renameTarget?.baseName ?? ""}
        extension={renameTarget?.extension ?? ""}
        onSave={(newBaseName) =>
          store.renameAsset(renameTarget!.id, newBaseName)
        }
        onClose={() => setRenameTarget(null)}
      />

      {/* Klasör oluşturma modal */}
      <GalleryFolderNameModal
        visible={createFolderVisible}
        title={t("folders.newFolder")}
        onSave={async (name) => {
          await store.createFolder(name);
          setCreateFolderVisible(false);
        }}
        onClose={() => setCreateFolderVisible(false)}
      />

      {/* Klasör yeniden adlandırma modal */}
      <GalleryFolderNameModal
        visible={renameFolderTarget !== null}
        title={t("folders.renameFolder")}
        initialValue={renameFolderTarget?.name ?? ""}
        onSave={async (name) => {
          await store.renameFolder(renameFolderTarget!.id, name);
          setRenameFolderTarget(null);
        }}
        onClose={() => setRenameFolderTarget(null)}
      />

      {/* Klasör taşıma picker */}
      <GalleryFolderPickerModal
        visible={moveFolderTarget !== null}
        title={t("folders.moveFolder")}
        excludeFolderIds={moveFolderTarget ? [moveFolderTarget] : []}
        onSelect={handleMoveFolderSelect}
        onClose={() => setMoveFolderTarget(null)}
      />

      {/* Asset taşıma picker */}
      <GalleryFolderPickerModal
        visible={moveAssetTarget !== null}
        title={t("folders.moveAsset")}
        onSelect={handleMoveAssetSelect}
        onClose={() => setMoveAssetTarget(null)}
      />

      {/* Toplu taşıma picker */}
      <GalleryFolderPickerModal
        visible={bulkMovePickerVisible}
        title={t("selection.moveTitle", { count: totalSelected })}
        excludeFolderIds={Array.from(store.selectedFolderIds)}
        onSelect={handleBulkMoveSelect}
        onClose={() => setBulkMovePickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
  contentWithBar: {
    paddingBottom: theme.spacing.xxl + 80,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
}));
