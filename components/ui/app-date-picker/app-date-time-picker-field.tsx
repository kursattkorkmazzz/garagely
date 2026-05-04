import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldError } from "@/components/ui/app-field/app-field-error";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
} from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import {
  AppTab,
  AppTabList,
  AppTabPanel,
  AppTabTrigger,
} from "@/components/ui/app-tab";
import { useI18n } from "@/i18n";
import { useUserPreferencesStore } from "@/stores/user-preferences.store";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Modal, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppDatePicker } from "./app-date-picker";
import { AppTimePicker } from "./app-time-picker";
import {
  type DateParts,
  datePlaceholder,
  dateTimePlaceholder,
  formatDate,
  formatDateTime,
  formatTime,
  localToUtc,
  timePlaceholder,
  utcToLocal,
} from "./date-time-utils";

export type DateTimePickerMode = "time" | "date" | "datetime";

type AppDateTimePickerFieldProps = {
  label: string;
  value: number | null;
  onChange: (utcMs: number) => void;
  mode: DateTimePickerMode;
  error?: string;
  placeholder?: string;
};

const NOW = () => Date.now();

export function AppDateTimePickerField({
  label,
  value,
  onChange,
  mode,
  error,
  placeholder,
}: AppDateTimePickerFieldProps) {
  const { t } = useI18n("components");
  const { theme } = useUnistyles();
  const { timezone, language } = useUserPreferencesStore();

  const [isOpen, setIsOpen] = useState(false);
  const [localParts, setLocalParts] = useState<DateParts>(() =>
    utcToLocal(value ?? NOW(), timezone),
  );
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");

  const openModal = () => {
    setLocalParts(utcToLocal(value ?? NOW(), timezone));
    setActiveTab("date");
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handlePartsChange = (parts: DateParts) => {
    setLocalParts(parts);
    onChange(localToUtc(parts, timezone));
  };

  const handleDatePartsChange = (parts: DateParts) => {
    handlePartsChange(parts);
    if (mode === "datetime") {
      setTimeout(() => setActiveTab("time"), 500);
    }
  };

  const displayValue = value != null
    ? mode === "time"
      ? formatTime(value, timezone)
      : mode === "date"
      ? formatDate(value, timezone, language)
      : formatDateTime(value, timezone, language)
    : null;

  const placeholderText = placeholder ?? (
    mode === "time"
      ? timePlaceholder(language)
      : mode === "date"
      ? datePlaceholder(language)
      : dateTimePlaceholder(language)
  );

  const modalTitle =
    mode === "time"
      ? t("dateTimePicker.titleTime")
      : mode === "date"
      ? t("dateTimePicker.titleDate")
      : t("dateTimePicker.titleDatetime");

  const leftIcon = mode === "time" ? "Clock" : "Calendar";

  return (
    <AppField>
      <AppFieldLabel>{label}</AppFieldLabel>
      <Pressable onPress={openModal}>
        <AppInputGroup error={!!error} disabled>
          <AppInputAddon position="left">
            <Icon name={leftIcon} size={16} color={theme.colors.mutedForeground} />
          </AppInputAddon>
          <AppInputField
            value={displayValue ?? ""}
            placeholder={placeholderText}
            editable={false}
            pointerEvents="none"
          />
        </AppInputGroup>
      </Pressable>
      {error ? <AppFieldError>{error}</AppFieldError> : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <GestureHandlerRootView style={styles.gestureRoot}>
          <View style={styles.backdrop}>
            <Pressable style={styles.backdropTap} onPress={closeModal} />
            <View style={styles.modalCard}>
              <AppText style={styles.modalTitle}>{modalTitle}</AppText>

              {mode === "datetime" ? (
                <AppTab
                  value={activeTab}
                  onChange={(v) => setActiveTab(v as "date" | "time")}
                >
                  <AppTabList>
                    <AppTabTrigger value="date">
                      {t("dateTimePicker.tabDate")}
                    </AppTabTrigger>
                    <AppTabTrigger value="time">
                      {t("dateTimePicker.tabTime")}
                    </AppTabTrigger>
                  </AppTabList>
                  <View style={styles.pickerArea}>
                    <AppTabPanel value="date">
                      <AppDatePicker
                        parts={localParts}
                        onChange={handleDatePartsChange}
                      />
                    </AppTabPanel>
                    <AppTabPanel value="time">
                      <AppTimePicker
                        parts={localParts}
                        onChange={handlePartsChange}
                      />
                    </AppTabPanel>
                  </View>
                </AppTab>
              ) : mode === "date" ? (
                <AppDatePicker
                  parts={localParts}
                  onChange={handlePartsChange}
                />
              ) : (
                <AppTimePicker
                  parts={localParts}
                  onChange={handlePartsChange}
                />
              )}

              <AppButton
                variant="primary"
                size="md"
                onPress={closeModal}
                style={styles.doneButton}
              >
                {t("dateTimePicker.done")}
              </AppButton>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </AppField>
  );
}

const styles = StyleSheet.create((theme) => ({
  gestureRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.heading4,
    color: theme.colors.foreground,
    textAlign: "center",
  },
  pickerArea: {
    marginTop: theme.spacing.md,
  },
  doneButton: {
    marginTop: theme.spacing.xs,
  },
}));
