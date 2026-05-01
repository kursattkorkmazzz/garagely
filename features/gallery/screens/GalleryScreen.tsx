import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { AppButton } from "@/components/ui/app-button";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { GalleryCategoryChips } from "@/features/gallery/components/GalleryCategoryChips";
import { GalleryDocumentList } from "@/features/gallery/components/GalleryDocumentList";
import { GalleryEmpty } from "@/features/gallery/components/GalleryEmpty";
import { GalleryFilterChips } from "@/features/gallery/components/GalleryFilterChips";
import { GalleryMediaGrid } from "@/features/gallery/components/GalleryMediaGrid";
import { GallerySelectionBar } from "@/features/gallery/components/GallerySelectionBar";
import { useI18n } from "@/i18n";
import { AppHeader } from "@/layouts/header/app-header";
import { useGalleryStore } from "@/stores/gallery.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { Stack } from "expo-router";
import { Upload } from "lucide-react-native/icons";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
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

  // ─── Upload ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    const uris = await pickedImageState.pickImageFromLibrary({
      allowsEditing: false,
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!uris || uris.length === 0) return;

    // Sıralı upload — SQLite paralel yazma çakışmasını önler
    for (const uri of uris) {
      await store.uploadImage(uri).catch(handleUIError);
    }
  };

  // ─── Seçim modu handler'ları ──────────────────────────────────────
  const handleLongPress = (id: string) => store.enterSelectionMode(id);
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
          // Seçim modu aktifken SelectionBar yüksekliği kadar yer bırak
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
              onPressAsset={() => {}}
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

      {/* Seçim action bar — ScrollView dışında, sabit pozisyonlu */}
      <GallerySelectionBar
        selectedCount={store.selectedIds.size}
        onDelete={handleDeleteSelected}
        onCancel={store.exitSelectionMode}
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
    // SelectionBar (~72px) + safe area için ekstra boşluk
    paddingBottom: theme.spacing.xxl + 80,
  },
}));
