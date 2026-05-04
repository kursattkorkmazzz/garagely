import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { MediaFolderService } from "@/features/asset/service/media-folder.service";
import { useI18n } from "@/i18n";
import { ChevronRight, FolderOpen, X } from "lucide-react-native/icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryFolderPickerModalProps = {
  visible: boolean;
  /** Modal başlığı — "Klasörü Taşı" veya "Dosyayı Taşı" */
  title: string;
  /**
   * Seçilmesi engellenen klasör ID'leri (taşınan klasörlerin kendileri).
   * Döngüsel referansı önler.
   */
  excludeFolderIds?: string[];
  onSelect: (folderId: string | null) => void;
  onClose: () => void;
};

export function GalleryFolderPickerModal({
  visible,
  title,
  excludeFolderIds = [],
  onSelect,
  onClose,
}: GalleryFolderPickerModalProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  // Modal içi navigasyon state'i
  const [localPath, setLocalPath] = useState<MediaFolderEntity[]>([]);
  const [localFolders, setLocalFolders] = useState<MediaFolderEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentLocalFolderId =
    localPath.length > 0 ? localPath[localPath.length - 1].id : null;
  const isAtRoot = localPath.length === 0;

  const loadFolders = async (parentId: string | null) => {
    setIsLoading(true);
    try {
      const folders = parentId
        ? await MediaFolderService.getChildren(parentId)
        : await MediaFolderService.getRootFolders();
      setLocalFolders(folders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    // Modal açıldığında root'tan başla
    setLocalPath([]);
    loadFolders(null);
  }, [visible]);

  const navigateInto = async (folder: MediaFolderEntity) => {
    setLocalPath((p) => [...p, folder]);
    await loadFolders(folder.id);
  };

  const navigateUp = async () => {
    const newPath = localPath.slice(0, -1);
    setLocalPath(newPath);
    const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    await loadFolders(parentId);
  };

  const handleSelect = () => {
    onSelect(currentLocalFolderId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.root,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* ─── Top bar ─────────────────────────────────────────── */}
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

        {/* ─── Breadcrumb ───────────────────────────────────────── */}
        <View
          style={[
            styles.breadcrumbBar,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          {/* Geri butonu */}
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

        {/* ─── Klasör listesi ───────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.mutedForeground} />
          </View>
        ) : (
          <FlatList
            data={localFolders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.centered}>
                <AppText style={{ color: theme.colors.mutedForeground }}>
                  {t("folders.noSubfolders")}
                </AppText>
              </View>
            }
            renderItem={({ item }) => {
              const isExcluded = excludeFolderIds.includes(item.id);
              return (
                <Pressable
                  onPress={() => !isExcluded && navigateInto(item)}
                  disabled={isExcluded}
                  style={[
                    styles.folderRow,
                    {
                      borderBottomColor: theme.colors.border,
                      opacity: isExcluded ? 0.35 : 1,
                    },
                  ]}
                >
                  <FolderOpen size={20} color={theme.colors.primary} />
                  <AppText
                    style={[
                      styles.folderName,
                      { color: theme.colors.foreground },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </AppText>
                  <ChevronRight
                    size={16}
                    color={theme.colors.mutedForeground}
                  />
                </Pressable>
              );
            }}
          />
        )}

        {/* ─── Alt bar — "Buraya Taşı" butonu ─────────────────── */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 8,
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <AppButton
            variant="primary"
            style={styles.selectBtn}
            onPress={handleSelect}
          >
            {t("folders.moveHere")}
          </AppButton>
        </View>
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
    flexGrow: 1,
  },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
  },
  folderName: {
    flex: 1,
    ...theme.typography.bodyMedium,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm + 2,
    borderTopWidth: 1,
  },
  selectBtn: {
    width: "100%",
  },
}));
