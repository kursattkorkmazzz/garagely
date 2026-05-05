import { AppButton } from "@/components/ui/app-button";
import { AppInputField, AppInputGroup } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { Tag } from "@/features/tag/entity/tag.entity";
import { resolveScopeLabel } from "@/features/tag/scope-registry";
import { TagService } from "@/features/tag/service/tag.service";
import { useI18n } from "@/i18n";
import { handleUIError } from "@/utils/handle-ui-error";
import { useFocusEffect } from "expo-router";
import { Pencil, Trash2 } from "lucide-react-native/icons";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TagScopeScreenProps = {
  scope: string;
};

export function TagScopeScreen({ scope }: TagScopeScreenProps) {
  const { t } = useI18n("tag");
  const { theme } = useUnistyles();
  const [tags, setTags] = useState<Tag[]>([]);
  const [renameTarget, setRenameTarget] = useState<Tag | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const load = useCallback(() => {
    TagService.getByScope(scope).then(setTags).catch(handleUIError);
  }, [scope]);

  useFocusEffect(load);

  const handleRename = (tag: Tag) => {
    setRenameTarget(tag);
    setRenameValue(tag.name);
  };

  const submitRename = () => {
    if (!renameTarget) return;
    TagService.rename(renameTarget.id, renameValue)
      .then(() => {
        setRenameTarget(null);
        setRenameValue("");
        load();
      })
      .catch(handleUIError);
  };

  const handleDelete = (tag: Tag) => {
    Alert.alert(
      t("actions.deleteConfirmTitle"),
      t("actions.deleteConfirmMessage", { name: tag.name }),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("actions.deleteConfirm"),
          style: "destructive",
          onPress: () => {
            TagService.delete(tag.id)
              .then(load)
              .catch(handleUIError);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <AppText style={[styles.name, { color: theme.colors.foreground }]}>
              {item.name}
            </AppText>
            <View style={styles.rowActions}>
              <Pressable onPress={() => handleRename(item)} style={styles.iconBtn}>
                <Pencil size={18} color={theme.colors.primary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} style={styles.iconBtn}>
                <Trash2 size={18} color={theme.colors.destructive} />
              </Pressable>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <AppText
            style={[styles.scopeTitle, { color: theme.colors.mutedForeground }]}
          >
            {resolveScopeLabel(scope)}
          </AppText>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppText
              style={[styles.empty, { color: theme.colors.mutedForeground }]}
            >
              {t("management.empty")}
            </AppText>
          </View>
        }
      />

      <Modal
        visible={renameTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setRenameTarget(null)}
          />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.card,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <AppText style={[styles.modalTitle, { color: theme.colors.foreground }]}>
              {t("rename.title")}
            </AppText>
            <AppInputGroup>
              <AppInputField
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder={t("rename.placeholder")}
                autoFocus
              />
            </AppInputGroup>
            <View style={styles.modalActions}>
              <AppButton
                variant="ghost"
                onPress={() => setRenameTarget(null)}
              >
                {t("actions.cancel")}
              </AppButton>
              <AppButton variant="primary" onPress={submitRename}>
                {t("rename.save")}
              </AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  scopeTitle: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderWidth: 1,
  },
  name: {
    ...theme.typography.bodyMedium,
    flex: 1,
  },
  rowActions: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  iconBtn: {
    padding: theme.spacing.xs,
  },
  emptyWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    alignItems: "center",
  },
  empty: {
    ...theme.typography.bodyMedium,
    textAlign: "center",
  },
  // modal
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    width: "85%",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.heading4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
  },
}));
