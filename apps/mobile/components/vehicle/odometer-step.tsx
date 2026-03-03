import { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppInput, InputField, InputLeftAction, InputRightAction } from "@/components/ui/app-input";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

type OdometerStepProps = {
  currentKm: string;
  purchaseDate: Date | null;
  purchasePrice: string;
  purchaseKm: string;
  onCurrentKmChange: (value: string) => void;
  onPurchaseDateChange: (value: Date | null) => void;
  onPurchasePriceChange: (value: string) => void;
  onPurchaseKmChange: (value: string) => void;
};

// Generate years from current year to 1950
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

const months = [
  { value: 0, labelEn: "January", labelTr: "Ocak" },
  { value: 1, labelEn: "February", labelTr: "Şubat" },
  { value: 2, labelEn: "March", labelTr: "Mart" },
  { value: 3, labelEn: "April", labelTr: "Nisan" },
  { value: 4, labelEn: "May", labelTr: "Mayıs" },
  { value: 5, labelEn: "June", labelTr: "Haziran" },
  { value: 6, labelEn: "July", labelTr: "Temmuz" },
  { value: 7, labelEn: "August", labelTr: "Ağustos" },
  { value: 8, labelEn: "September", labelTr: "Eylül" },
  { value: 9, labelEn: "October", labelTr: "Ekim" },
  { value: 10, labelEn: "November", labelTr: "Kasım" },
  { value: 11, labelEn: "December", labelTr: "Aralık" },
];

export function OdometerStep({
  currentKm,
  purchaseDate,
  purchasePrice,
  purchaseKm,
  onCurrentKmChange,
  onPurchaseDateChange,
  onPurchasePriceChange,
  onPurchaseKmChange,
}: OdometerStepProps) {
  const { theme, withOpacity } = useTheme();
  const { t, language } = useI18n();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempMonth, setTempMonth] = useState<number>(purchaseDate?.getMonth() ?? new Date().getMonth());
  const [tempYear, setTempYear] = useState<number>(purchaseDate?.getFullYear() ?? currentYear);

  const formatNumber = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleOpenDatePicker = () => {
    if (purchaseDate) {
      setTempMonth(purchaseDate.getMonth());
      setTempYear(purchaseDate.getFullYear());
    } else {
      setTempMonth(new Date().getMonth());
      setTempYear(currentYear);
    }
    setShowDatePicker(true);
  };

  const handleConfirmDate = () => {
    const selectedDate = new Date(tempYear, tempMonth, 1);
    onPurchaseDateChange(selectedDate);
    setShowDatePicker(false);
  };

  const handleCurrentKmChange = (value: string) => {
    onCurrentKmChange(formatNumber(value));
  };

  const handlePurchasePriceChange = (value: string) => {
    onPurchasePriceChange(formatNumber(value));
  };

  const handlePurchaseKmChange = (value: string) => {
    onPurchaseKmChange(formatNumber(value));
  };

  const localizedMonths = useMemo(
    () => months.map((m) => ({ value: m.value, label: language === "tr" ? m.labelTr : m.labelEn })),
    [language],
  );

  return (
    <View style={styles.container}>
      {/* Skip hint */}
      <View style={[styles.hintContainer, { backgroundColor: withOpacity(theme.primary, 0.1) }]}>
        <AppIcon icon="Info" size={16} color={theme.primary} />
        <AppText variant="bodySmall" color="primary" style={styles.hintText}>
          {t("addVehicle.optionalStepHint")}
        </AppText>
      </View>

      {/* Current Odometer */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.currentKm")}
        </AppText>
        <AppInput>
          <InputLeftAction>
            <AppIcon icon="Gauge" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder={t("addVehicle.currentKmPlaceholder")}
            value={currentKm}
            onChangeText={handleCurrentKmChange}
            keyboardType="numeric"
          />
          <InputRightAction>
            <AppText variant="bodySmall" color="muted">
              km
            </AppText>
          </InputRightAction>
        </AppInput>
      </View>

      {/* Purchase Date */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.purchaseDate")}
        </AppText>
        <Pressable onPress={handleOpenDatePicker}>
          <AppInput pointerEvents="none">
            <InputLeftAction>
              <AppIcon icon="Calendar" size={20} color={theme.mutedForeground} />
            </InputLeftAction>
            <InputField
              placeholder={t("addVehicle.purchaseDatePlaceholder")}
              value={formatDate(purchaseDate)}
              editable={false}
            />
            {purchaseDate && (
              <InputRightAction>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onPurchaseDateChange(null);
                  }}
                >
                  <AppIcon icon="X" size={18} color={theme.mutedForeground} />
                </Pressable>
              </InputRightAction>
            )}
          </AppInput>
        </Pressable>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: withOpacity("#000000", 0.5) }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <AppText variant="heading3" style={styles.modalTitle}>
                  {t("addVehicle.purchaseDate")}
                </AppText>

                {/* Month/Year Selectors */}
                <View style={styles.pickerRow}>
                  {/* Month Picker */}
                  <View style={styles.pickerColumn}>
                    <AppText variant="bodySmall" color="muted" style={styles.pickerLabel}>
                      {language === "tr" ? "Ay" : "Month"}
                    </AppText>
                    <ScrollView
                      style={[styles.pickerScroll, { borderColor: theme.border }]}
                      showsVerticalScrollIndicator={false}
                    >
                      {localizedMonths.map((month) => (
                        <Pressable
                          key={month.value}
                          onPress={() => setTempMonth(month.value)}
                          style={[
                            styles.pickerItem,
                            tempMonth === month.value && {
                              backgroundColor: withOpacity(theme.primary, 0.15),
                            },
                          ]}
                        >
                          <AppText
                            variant="bodyMedium"
                            style={tempMonth === month.value && { color: theme.primary, fontWeight: "600" }}
                          >
                            {month.label}
                          </AppText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Year Picker */}
                  <View style={styles.pickerColumn}>
                    <AppText variant="bodySmall" color="muted" style={styles.pickerLabel}>
                      {language === "tr" ? "Yıl" : "Year"}
                    </AppText>
                    <ScrollView
                      style={[styles.pickerScroll, { borderColor: theme.border }]}
                      showsVerticalScrollIndicator={false}
                    >
                      {years.map((year) => (
                        <Pressable
                          key={year}
                          onPress={() => setTempYear(year)}
                          style={[
                            styles.pickerItem,
                            tempYear === year && {
                              backgroundColor: withOpacity(theme.primary, 0.15),
                            },
                          ]}
                        >
                          <AppText
                            variant="bodyMedium"
                            style={tempYear === year && { color: theme.primary, fontWeight: "600" }}
                          >
                            {year}
                          </AppText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <AppButton
                    variant="ghost"
                    onPress={() => setShowDatePicker(false)}
                    style={styles.modalButton}
                  >
                    {t("common:buttons.cancel")}
                  </AppButton>
                  <AppButton
                    variant="primary"
                    onPress={handleConfirmDate}
                    style={styles.modalButton}
                  >
                    {t("common:buttons.confirm")}
                  </AppButton>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Purchase Price */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.purchasePrice")}
        </AppText>
        <AppInput>
          <InputLeftAction>
            <AppIcon icon="DollarSign" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder={t("addVehicle.purchasePricePlaceholder")}
            value={purchasePrice}
            onChangeText={handlePurchasePriceChange}
            keyboardType="numeric"
          />
        </AppInput>
      </View>

      {/* Purchase Odometer */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.purchaseKm")}
        </AppText>
        <AppInput>
          <InputLeftAction>
            <AppIcon icon="Gauge" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder={t("addVehicle.purchaseKmPlaceholder")}
            value={purchaseKm}
            onChangeText={handlePurchaseKmChange}
            keyboardType="numeric"
          />
          <InputRightAction>
            <AppText variant="bodySmall" color="muted">
              km
            </AppText>
          </InputRightAction>
        </AppInput>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius * 2,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  hintText: {
    flex: 1,
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    borderRadius: radius * 2,
    padding: spacing.lg,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  pickerRow: {
    flexDirection: "row",
    gap: spacing.md,
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
    height: 200,
    borderWidth: 1,
    borderRadius: radius * 2,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius,
    marginHorizontal: spacing.xs,
    marginVertical: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
