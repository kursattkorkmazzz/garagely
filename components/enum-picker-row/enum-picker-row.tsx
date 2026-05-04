import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldError } from "@/components/ui/app-field/app-field-error";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
} from "@/components/ui/app-input";
import { useI18n } from "@/i18n";
import { TranslationNamespaces } from "@/i18n/types/namespace";
import { ChevronRight } from "lucide-react-native/icons";
import { Pressable } from "react-native";
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

  /*
  
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
    
    */
  return (
    <AppField>
      <AppFieldLabel>{label}</AppFieldLabel>
      <Pressable onPress={onPress}>
        <AppInputGroup style={styles.pickerRow}>
          <AppInputField
            editable={false}
            value={value}
            placeholder={t("selectPlaceholder")}
          />
          <AppInputAddon>
            <ChevronRight size={16} color={theme.colors.muted} />
          </AppInputAddon>
        </AppInputGroup>
      </Pressable>
      {error ? <AppFieldError>{error}</AppFieldError> : null}
    </AppField>
  );
}

const styles = StyleSheet.create((theme) => ({
  pickerRow: {
    width: "100%",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    minHeight: 44,
  },
  pickerValue: {
    color: theme.colors.foreground,
    width: "100%",
  },
}));
