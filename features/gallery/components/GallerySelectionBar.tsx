import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { FolderInput, Trash2 } from "lucide-react-native/icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GallerySelectionBarProps = {
  selectedCount: number;
  onMove: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

export function GallerySelectionBar({
  selectedCount,
  onMove,
  onDelete,
  onCancel,
}: GallerySelectionBarProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  if (selectedCount === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + theme.spacing.sm },
      ]}
    >
      <AppText style={styles.countText}>
        {t("selection.itemsSelected", { count: selectedCount })}
      </AppText>
      <View style={styles.actions}>
        <AppButton variant="ghost" size="sm" onPress={onCancel}>
          {t("selection.cancel")}
        </AppButton>
        <AppButton variant="outline" size="sm" onPress={onMove}>
          <View style={styles.actionButtonContent}>
            <FolderInput size={15} color={theme.colors.foreground} />
            <AppText style={[styles.actionLabel, { color: theme.colors.foreground }]}>
              {t("selection.move")}
            </AppText>
          </View>
        </AppButton>
        <AppButton variant="outline" size="sm" onPress={onDelete}>
          <View style={styles.actionButtonContent}>
            <Trash2 size={15} color={theme.colors.destructive} />
            <AppText
              style={[styles.actionLabel, { color: theme.colors.destructive }]}
            >
              {t("selection.delete")}
            </AppText>
          </View>
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  countText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.foreground,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  actionLabel: {
    ...theme.typography.buttonSmall,
  },
}));
