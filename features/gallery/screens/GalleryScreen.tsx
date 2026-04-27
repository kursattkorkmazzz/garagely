import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { AppListSectionHeader } from "@/components/list/list-section-header";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { GalleryCategoryChips } from "@/features/gallery/components/GalleryCategoryChips";
import { GalleryDocumentList } from "@/features/gallery/components/GalleryDocumentList";
import { GalleryEmpty } from "@/features/gallery/components/GalleryEmpty";
import { GalleryFilterChips } from "@/features/gallery/components/GalleryFilterChips";
import { GalleryMediaGrid } from "@/features/gallery/components/GalleryMediaGrid";
import { GalleryRecentStrip } from "@/features/gallery/components/GalleryRecentStrip";
import { useI18n } from "@/i18n";
import { useGalleryStore } from "@/stores/gallery.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { useEffect } from "react";
import {
  ActivityIndicator,
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

  const pickedImageState = usePickedImage({ allowsMultipleSelection: false });

  useEffect(() => {
    store.loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
    if (nearEnd) store.loadMore();
  };

  const handleUpload = () => {
    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            title: "",
            data: [{ key: "library", label: t("uploadPhoto") }],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            onPress={async () => {
              SheetManager.hide("select-sheet");
              const uris = await pickedImageState.pickImageFromLibrary({
                allowsEditing: false,
                mediaTypes: ["images"],
                quality: 0.85,
              });
              if (uris?.[0]) {
                await store.uploadImage(uris[0]).catch(handleUIError);
              }
            }}
          />
        ),
      },
    });
  };

  const filtered = store.getFilteredAssets();
  const recentAssets = store.getRecentAssets();
  const mediaAssets = filtered.filter(
    (a) => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO,
  );
  const docAssets = filtered.filter((a) => a.type === AssetTypes.DOCUMENT);

  if (store.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.mutedForeground} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* Type filter chips */}
      <GalleryFilterChips
        active={store.activeTypeFilter}
        onChange={store.setTypeFilter}
      />

      {/* Son Eklenenler */}
      {recentAssets.length > 0 && (
        <>
          <AppListSectionHeader title={t("sections.recent")} />
          <GalleryRecentStrip assets={recentAssets} onPressAsset={() => {}} />
        </>
      )}

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
            onPressAsset={() => {}}
          />
        </>
      )}

      {/* Belgeler list */}
      {docAssets.length > 0 && (
        <>
          <AppListSectionHeader title={t("sections.documents")} />
          <GalleryDocumentList assets={docAssets} onPressAsset={() => {}} />
        </>
      )}

      {/* Empty state */}
      {filtered.length === 0 && <GalleryEmpty onUpload={handleUpload} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
}));
