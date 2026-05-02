import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { AppImageViewer, ImageViewerItem } from "@/components/ui/app-image-viewer";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppButton } from "@/components/ui/app-button";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { formatBytes } from "@/features/gallery/utils/format-bytes";
import { truncateFileName } from "@/features/gallery/utils/truncate-file-name";
import { GalleryCategoryChips } from "@/features/gallery/components/GalleryCategoryChips";
import { GalleryDocumentList } from "@/features/gallery/components/GalleryDocumentList";
import { GalleryEmpty } from "@/features/gallery/components/GalleryEmpty";
import { GalleryFilterChips } from "@/features/gallery/components/GalleryFilterChips";
import { GalleryMediaGrid } from "@/features/gallery/components/GalleryMediaGrid";
import { GalleryRenameModal } from "@/features/gallery/components/GalleryRenameModal";
import { GallerySelectionBar } from "@/features/gallery/components/GallerySelectionBar";
import { AppHeader } from "@/layouts/header/app-header";
import { useI18n } from "@/i18n";
import { useGalleryStore } from "@/stores/gallery.store";
import { handleUIError } from "@/utils/handle-ui-error";
import * as DocumentPicker from "expo-document-picker";
import { Stack } from "expo-router";
import { Upload } from "lucide-react-native/icons";
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

  // ─── Image preview ────────────────────────────────────────────────
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // ─── Rename ───────────────────────────────────────────────────────
  type RenameTarget = { id: string; baseName: string; extension: string };
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);

  const handlePressMedia = (id: string) => {
    const index = imageAssets.findIndex((a) => a.id === id);
    if (index !== -1) setPreviewIndex(index);
  };

  // ─── Seçim modu handler'ları ──────────────────────────────────────
  const handleLongPress = (id: string) => {
    const asset = store.assetsById[id];
    if (!asset) return;

    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            data: [
              { key: "select", label: t("itemActions.select"), icon: "CheckSquare" },
              { key: "rename", label: t("itemActions.rename"), icon: "Pencil" },
              { key: "delete", label: t("itemActions.delete"), icon: "Trash2" },
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

  const handleDeleteSelected = () => {
    Alert.alert(
      t("selection.deleteConfirmTitle", { count: store.selectedIds.size }),
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

  // ─── Veriler ──────────────────────────────────────────────────────
  const filtered = store.getFilteredAssets();
  const mediaAssets = filtered.filter(
    (a) => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO,
  );
  const docAssets = filtered.filter((a) => a.type === AssetTypes.DOCUMENT);

  // Only IMAGE assets go into the viewer (VIDEO not supported by GalleryPreview)
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
            title="Gallery"
            icon="FolderOpen"
            goBack={true}
            RightComponent={
              <AppButton variant="ghost" size="icon" onPress={handleUpload}>
                <Upload size={20} color={theme.colors.primary} />
              </AppButton>
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
        {/* Type filter chips */}
        <GalleryFilterChips
          active={store.activeTypeFilter}
          onChange={store.setTypeFilter}
        />

        {/* Category chips */}
        <GalleryCategoryChips
          categories={store.categories}
          activeId={store.activeCategoryId}
          onSelect={store.setActiveCategory}
        />

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

        {/* Belgeler list */}
        {docAssets.length > 0 && (
          <>
            <AppListSectionHeader title={t("sections.documents")} />
            <GalleryDocumentList
              assets={docAssets}
              isSelecting={store.isSelecting}
              selectedIds={store.selectedIds}
              onPressAsset={() => {}}
              onLongPressAsset={handleLongPress}
              onSelectAsset={handleSelect}
            />
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && <GalleryEmpty onUpload={handleUpload} />}
      </ScrollView>

      {/* Seçim action bar */}
      <GallerySelectionBar
        selectedCount={store.selectedIds.size}
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

      {/* Rename modal */}
      <GalleryRenameModal
        visible={renameTarget !== null}
        currentBaseName={renameTarget?.baseName ?? ""}
        extension={renameTarget?.extension ?? ""}
        onSave={(newBaseName) =>
          store.renameAsset(renameTarget!.id, newBaseName)
        }
        onClose={() => setRenameTarget(null)}
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
}));
