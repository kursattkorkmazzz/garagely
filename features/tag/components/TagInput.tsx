import { AppButton } from "@/components/ui/app-button";
import { AppInputField, AppInputGroup } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { Tag } from "@/features/tag/entity/tag.entity";
import { TagService } from "@/features/tag/service/tag.service";
import { handleUIError } from "@/utils/handle-ui-error";
import { Plus, X } from "lucide-react-native/icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type TagInputLabels = {
  addNewPlaceholder: string;
  addButton: string;
  selectedTitle: string;
  suggestionsTitle: string;
  emptySuggestions: string;
  emptySelected: string;
};

export type TagInputProps = {
  scope: string;
  selectedExistingIds: string[];
  newTagNames: string[];
  onChange: (existingIds: string[], newNames: string[]) => void;
  labels: TagInputLabels;
  disabled?: boolean;
};

export function TagInput({
  scope,
  selectedExistingIds,
  newTagNames,
  onChange,
  labels,
  disabled,
}: TagInputProps) {
  const { theme } = useUnistyles();

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!scope) {
      setAllTags([]);
      return;
    }
    TagService.getByScope(scope).then(setAllTags).catch(handleUIError);
  }, [scope]);

  const selectedSet = useMemo(
    () => new Set(selectedExistingIds),
    [selectedExistingIds],
  );

  const tagsById = useMemo(() => {
    const map = new Map<string, Tag>();
    allTags.forEach((t) => map.set(t.id, t));
    return map;
  }, [allTags]);

  const selectedTags = useMemo(
    () => selectedExistingIds.map((id) => tagsById.get(id)).filter(Boolean) as Tag[],
    [selectedExistingIds, tagsById],
  );

  const suggestions = useMemo(
    () => allTags.filter((t) => !selectedSet.has(t.id)),
    [allTags, selectedSet],
  );

  const addExisting = (id: string) => {
    if (selectedSet.has(id)) return;
    onChange([...selectedExistingIds, id], newTagNames);
  };

  const removeExisting = (id: string) => {
    onChange(
      selectedExistingIds.filter((x) => x !== id),
      newTagNames,
    );
  };

  const removeNewName = (name: string) => {
    onChange(
      selectedExistingIds,
      newTagNames.filter((n) => n !== name),
    );
  };

  const submitDraft = () => {
    const trimmed = draft.trim().replace(/\s+/g, " ");
    if (!trimmed) return;

    // Mevcut tag suggestion'ları arasında eşleşen var mı? (case-insensitive)
    const existingMatch = allTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existingMatch) {
      if (!selectedSet.has(existingMatch.id)) {
        onChange([...selectedExistingIds, existingMatch.id], newTagNames);
      }
      setDraft("");
      return;
    }

    // newTagNames içinde duplicate?
    const dupNew = newTagNames.find(
      (n) => n.toLowerCase() === trimmed.toLowerCase(),
    );
    if (dupNew) {
      setDraft("");
      return;
    }

    onChange(selectedExistingIds, [...newTagNames, trimmed]);
    setDraft("");
  };

  const renderChip = (
    key: string,
    label: string,
    onRemove: () => void,
    variant: "selected" | "suggestion",
  ) => (
    <Pressable
      key={key}
      onPress={variant === "suggestion" ? onRemove : undefined}
      style={[
        styles.chip,
        {
          backgroundColor:
            variant === "selected"
              ? theme.colors.primary
              : theme.utils.withOpacity(theme.colors.foreground, 0.06),
          borderColor:
            variant === "selected"
              ? theme.colors.primary
              : theme.colors.border,
        },
      ]}
    >
      <AppText
        style={[
          styles.chipText,
          {
            color:
              variant === "selected"
                ? theme.colors.primaryForeground
                : theme.colors.foreground,
          },
        ]}
      >
        {label}
      </AppText>
      {variant === "selected" ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          disabled={disabled}
        >
          <X size={14} color={theme.colors.primaryForeground} />
        </Pressable>
      ) : (
        <Plus size={14} color={theme.colors.foreground} />
      )}
    </Pressable>
  );

  const hasSelection = selectedTags.length > 0 || newTagNames.length > 0;

  return (
    <View style={styles.container}>
      {/* Seçili chip'ler */}
      <View style={styles.section}>
        <AppText style={[styles.sectionLabel, { color: theme.colors.mutedForeground }]}>
          {labels.selectedTitle}
        </AppText>
        {hasSelection ? (
          <View style={styles.chipRow}>
            {selectedTags.map((t) =>
              renderChip(`e:${t.id}`, t.name, () => removeExisting(t.id), "selected"),
            )}
            {newTagNames.map((n) =>
              renderChip(`n:${n}`, n, () => removeNewName(n), "selected"),
            )}
          </View>
        ) : (
          <AppText
            style={[styles.emptyText, { color: theme.colors.mutedForeground }]}
          >
            {labels.emptySelected}
          </AppText>
        )}
      </View>

      {/* Yeni tag input + buton */}
      <View style={styles.inputRow}>
        <View style={styles.inputFlex}>
          <AppInputGroup disabled={disabled}>
            <AppInputField
              value={draft}
              onChangeText={setDraft}
              placeholder={labels.addNewPlaceholder}
              onSubmitEditing={submitDraft}
              returnKeyType="done"
              editable={!disabled}
            />
          </AppInputGroup>
        </View>
        <AppButton
          variant="secondary"
          size="md"
          onPress={submitDraft}
          disabled={disabled || draft.trim().length === 0}
        >
          {labels.addButton}
        </AppButton>
      </View>

      {/* Suggestions */}
      <View style={styles.section}>
        <AppText style={[styles.sectionLabel, { color: theme.colors.mutedForeground }]}>
          {labels.suggestionsTitle}
        </AppText>
        {suggestions.length > 0 ? (
          <View style={styles.chipRow}>
            {suggestions.map((t) =>
              renderChip(`s:${t.id}`, t.name, () => addExisting(t.id), "suggestion"),
            )}
          </View>
        ) : (
          <AppText
            style={[styles.emptyText, { color: theme.colors.mutedForeground }]}
          >
            {labels.emptySuggestions}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionLabel: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  emptyText: {
    ...theme.typography.caption,
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  inputFlex: {
    flex: 1,
  },
}));
