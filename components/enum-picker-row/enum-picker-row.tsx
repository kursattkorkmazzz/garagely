import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { TranslationNamespaces } from "@/i18n/types/namespace";
import { ChevronRight } from "lucide-react-native/icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type EnumPickerRowProps = {
  label: string;
  value: string;
  error?: string;
  onPress: () => void;
};

export function EnumPickerRow({
  label,
  value,
  error,
  onPress,
}: EnumPickerRowProps) {
  const { t } = useI18n(TranslationNamespaces.COMMON);
  const { theme } = useUnistyles();

  return (
    <View style={styles.fieldWrapper}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <Pressable
        onPress={onPress}
        style={(s) => [
          styles.pickerRow,
          {
            borderColor: error
              ? theme.colors.destructive
              : s.pressed
                ? theme.colors.ring
                : theme.colors.border,
          },
        ]}
      >
        <AppText
          style={[
            styles.pickerValue,
            {
              color: value
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {value || t("selectPlaceholder")}
        </AppText>
        <ChevronRight size={16} color={theme.colors.muted} />
      </Pressable>
      {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  fieldWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.mutedForeground,
  },
  pickerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
  },
  pickerValue: {
    ...theme.typography.bodyMedium,
    flex: 1,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.destructive,
  },
}));
