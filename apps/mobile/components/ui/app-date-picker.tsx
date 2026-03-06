import { useState, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import { AppText } from "./app-text";
import { AppView } from "./app-view";
import { AppButton } from "./app-button";
import { AppIcon } from "./app-icon";
import {
  AppInput,
  AppInputField,
  AppInputLabel,
  AppInputLeftAction,
  AppInputRightAction,
  AppInputErrorMessage,
} from "./app-input-v2";

export type DatePickerMode =
  | "date"
  | "time"
  | "datetime"
  | "year"
  | "month"
  | "day"
  | "month-year";

type AppDatePickerProps = {
  mode: DatePickerMode;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
};

const MONTH_COUNT = 12;
const currentYear = new Date().getFullYear();

export function AppDatePicker({
  mode,
  value,
  onChange,
  placeholder,
  label,
  minDate,
  maxDate,
  disabled = false,
  error,
}: AppDatePickerProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const [showPicker, setShowPicker] = useState(false);

  // Temp values for picker
  const [tempYear, setTempYear] = useState(value?.getFullYear() ?? currentYear);
  const [tempMonth, setTempMonth] = useState(value?.getMonth() ?? 0);
  const [tempDay, setTempDay] = useState(value?.getDate() ?? 1);
  const [tempHour, setTempHour] = useState(value?.getHours() ?? 12);
  const [tempMinute, setTempMinute] = useState(value?.getMinutes() ?? 0);

  // Months as numbers (1-12) for picker display
  const months = useMemo(
    () => Array.from({ length: MONTH_COUNT }, (_, index) => index + 1),
    []
  );

  const minYear = minDate?.getFullYear() ?? 1950;
  const maxYear = maxDate?.getFullYear() ?? currentYear + 10;
  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear]
  );

  const daysInMonth = useMemo(() => {
    return new Date(tempYear, tempMonth + 1, 0).getDate();
  }, [tempYear, tempMonth]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const handleOpen = () => {
    if (disabled) return;
    // Initialize temp values from current value
    if (value) {
      setTempYear(value.getFullYear());
      setTempMonth(value.getMonth());
      setTempDay(value.getDate());
      setTempHour(value.getHours());
      setTempMinute(value.getMinutes());
    } else {
      setTempYear(currentYear);
      setTempMonth(new Date().getMonth());
      setTempDay(1);
      setTempHour(12);
      setTempMinute(0);
    }
    setShowPicker(true);
  };

  const handleConfirm = () => {
    let selectedDate: Date;

    switch (mode) {
      case "year":
        selectedDate = new Date(tempYear, 0, 1);
        break;
      case "month":
        selectedDate = new Date(currentYear, tempMonth, 1);
        break;
      case "month-year":
        selectedDate = new Date(tempYear, tempMonth, 1);
        break;
      case "day":
        selectedDate = new Date(currentYear, 0, tempDay);
        break;
      case "time":
        selectedDate = new Date();
        selectedDate.setHours(tempHour, tempMinute, 0, 0);
        break;
      case "datetime":
        selectedDate = new Date(tempYear, tempMonth, tempDay, tempHour, tempMinute);
        break;
      case "date":
      default:
        selectedDate = new Date(tempYear, tempMonth, tempDay);
        break;
    }

    onChange(selectedDate);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
    setShowPicker(false);
  };

  const formatDisplayValue = (): string => {
    if (!value) return "";

    const monthIndex = value.getMonth();

    switch (mode) {
      case "year":
        return value.getFullYear().toString();
      case "month":
        return t(`dates:months.${monthIndex}`);
      case "month-year":
        return `${t(`dates:months.${monthIndex}`)} ${value.getFullYear()}`;
      case "day":
        return value.getDate().toString();
      case "time":
        return `${value.getHours().toString().padStart(2, "0")}:${value.getMinutes().toString().padStart(2, "0")}`;
      case "datetime":
        return `${value.getDate()} ${t(`dates:monthsShort.${monthIndex}`)} ${value.getFullYear()} ${value.getHours().toString().padStart(2, "0")}:${value.getMinutes().toString().padStart(2, "0")}`;
      case "date":
      default:
        return `${value.getDate()} ${t(`dates:months.${monthIndex}`)} ${value.getFullYear()}`;
    }
  };

  const showYearPicker = ["date", "datetime", "year", "month-year"].includes(mode);
  const showMonthPicker = ["date", "datetime", "month", "month-year"].includes(mode);
  const showDayPicker = ["date", "datetime", "day"].includes(mode);
  const showTimePicker = ["time", "datetime"].includes(mode);

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: withOpacity("#000000", 0.5),
      padding: spacing.lg,
    },
    modalContent: {
      width: "100%",
      backgroundColor: theme.card,
      borderRadius: radius * 2,
      padding: spacing.lg,
    },
    modalTitle: {
      textAlign: "center",
      marginBottom: spacing.lg,
      fontWeight: "600",
    },
    pickersRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    pickerColumn: {
      flex: 1,
    },
    pickerLabel: {
      textAlign: "center",
      marginBottom: spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    pickerScroll: {
      height: 180,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius * 2,
    },
    pickerItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius,
      marginHorizontal: spacing.xs,
      marginVertical: 2,
    },
    pickerItemSelected: {
      backgroundColor: withOpacity(theme.primary, 0.15),
    },
    pickerItemText: {
      textAlign: "center",
    },
    pickerItemTextSelected: {
      color: theme.primary,
      fontWeight: "600",
    },
    actions: {
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "flex-end",
    },
  });

  const renderPickerColumn = (
    items: { value: number; label: string }[] | number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    labelKey: string
  ) => (
    <View style={styles.pickerColumn}>
      <AppText variant="caption" color="muted" style={styles.pickerLabel}>
        {labelKey}
      </AppText>
      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const itemValue = typeof item === "number" ? item : item.value;
          const itemLabel =
            typeof item === "number"
              ? item.toString().padStart(2, "0")
              : item.label;
          const isSelected = selectedValue === itemValue;

          return (
            <Pressable
              key={itemValue}
              onPress={() => onSelect(itemValue)}
              style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
            >
              <AppText
                variant="bodyMedium"
                style={[
                  styles.pickerItemText,
                  isSelected && styles.pickerItemTextSelected,
                ]}
              >
                {itemLabel}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <>
      <Pressable onPress={handleOpen}>
        <AppInput
          AppInputLabel={label ? <AppInputLabel>{label}</AppInputLabel> : undefined}
          AppInputField={
            <AppInputField
              placeholder={placeholder || t("dates:labels.selectDate")}
              value={formatDisplayValue()}
              editable={false}
              pointerEvents="none"
              InputLeftAction={
                <AppInputLeftAction>
                  <AppIcon
                    icon={showTimePicker && !showDayPicker ? "Clock" : "Calendar"}
                    size={20}
                    color={theme.mutedForeground}
                  />
                </AppInputLeftAction>
              }
              InputRightAction={
                <AppInputRightAction>
                  <AppIcon icon="ChevronDown" size={20} color={theme.mutedForeground} />
                </AppInputRightAction>
              }
            />
          }
          AppInputErrorMessage={
            <AppInputErrorMessage>{error}</AppInputErrorMessage>
          }
        />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <AppText variant="heading3" style={styles.modalTitle}>
                  {label || t("dates:labels.selectDate")}
                </AppText>

                <AppView style={styles.pickersRow}>
                  {showMonthPicker &&
                    renderPickerColumn(
                      months,
                      tempMonth + 1,
                      (value) => setTempMonth(value - 1),
                      t("dates:labels.month")
                    )}
                  {showDayPicker &&
                    renderPickerColumn(
                      days,
                      tempDay,
                      setTempDay,
                      t("dates:labels.day")
                    )}
                  {showYearPicker &&
                    renderPickerColumn(
                      years,
                      tempYear,
                      setTempYear,
                      t("dates:labels.year")
                    )}
                </AppView>

                {showTimePicker && (
                  <AppView style={styles.pickersRow}>
                    {renderPickerColumn(
                      hours,
                      tempHour,
                      setTempHour,
                      t("dates:labels.hour")
                    )}
                    {renderPickerColumn(
                      minutes,
                      tempMinute,
                      setTempMinute,
                      t("dates:labels.minute")
                    )}
                  </AppView>
                )}

                <AppView style={styles.actions}>
                  {value && (
                    <AppButton
                      variant="ghost"
                      onPress={handleClear}
                      size="sm"
                    >
                      <AppIcon icon="Trash2" size={18} color={theme.destructive} />
                    </AppButton>
                  )}
                  <AppButton
                    variant="ghost"
                    onPress={() => setShowPicker(false)}
                    size="sm"
                  >
                    {t("common:buttons.cancel")}
                  </AppButton>
                  <AppButton
                    variant="primary"
                    onPress={handleConfirm}
                    size="sm"
                  >
                    {t("common:buttons.confirm")}
                  </AppButton>
                </AppView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
