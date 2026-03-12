import { ScrollView, StyleSheet } from "react-native";
import { useFormikContext } from "formik";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores/root.store";
import { spacing } from "@/theme/tokens/spacing";
import { AppIcon } from "@/components/ui/app-icon";
import {
  AppInput,
  AppInputField,
  AppInputLabel,
  AppInputErrorMessage,
  AppInputLeftAction,
} from "@/components/ui/app-input-v2";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { AddVehicleFormState } from "../../add-vehicle-wizard";

export function OdometerStep() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext<AddVehicleFormState>();

  // Get user preferences from store
  const user = useStore((state) => state.auth.user);
  const distanceUnit = user?.preferences?.preferredDistanceUnit || "km";
  const currency = user?.preferences?.preferredCurrency || "usd";

  // Get labels from localization (scalable)
  const distanceLabel = t(`profile.distanceUnitsShort.${distanceUnit}`);
  const currencySymbol = t(`profile.currencySymbols.${currency}`);

  const formatNumericInput = (value: string): string => {
    return value.replace(/[^0-9]/g, "");
  };

  // TODO: Re-enable when current KM tracking is needed
  // const handleCurrentKmChange = (value: string) => {
  //   const numericValue = formatNumericInput(value);
  //   formik.setFieldValue("currentKm", numericValue ? parseInt(numericValue, 10) : 0);
  // };

  const handlePurchasePriceChange = (value: string) => {
    const numericValue = formatNumericInput(value);
    formik.setFieldValue("purchasePrice", numericValue ? parseInt(numericValue, 10) : 0);
  };

  const handlePurchaseKmChange = (value: string) => {
    const numericValue = formatNumericInput(value);
    formik.setFieldValue("purchaseKm", numericValue ? parseInt(numericValue, 10) : 0);
  };

  const handlePurchaseDateChange = (date: Date | null) => {
    formik.setFieldValue("purchaseDate", date);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* TODO: Re-enable when current KM tracking is needed
      <AppInput
          AppInputLabel={
            <AppInputLabel>
              {t("addVehicle.currentKm")} ({distanceLabel})
            </AppInputLabel>
          }
          AppInputField={
            <AppInputField
              placeholder={t("addVehicle.currentKmPlaceholder")}
              value={formik.values.currentKm ? formik.values.currentKm.toString() : ""}
              onChangeText={handleCurrentKmChange}
              onBlur={formik.handleBlur("currentKm")}
              keyboardType="numeric"
              InputLeftAction={
                <AppInputLeftAction>
                  <AppIcon icon="Gauge" size={20} color={theme.mutedForeground} />
                </AppInputLeftAction>
              }
            />
          }
          AppInputErrorMessage={
            <AppInputErrorMessage>
              {formik.touched.currentKm && formik.errors.currentKm}
            </AppInputErrorMessage>
          }
      />
      */}

      {/* Purchase Date */}
      <AppDatePicker
        mode="date"
        label={t("addVehicle.purchaseDate")}
        placeholder={t("addVehicle.purchaseDatePlaceholder")}
        value={formik.values.purchaseDate}
        onChange={handlePurchaseDateChange}
        maxDate={new Date()}
        error={formik.touched.purchaseDate && formik.errors.purchaseDate ? String(formik.errors.purchaseDate) : undefined}
      />

      {/* Purchase Price */}
      <AppInput
          AppInputLabel={
            <AppInputLabel>
              {t("addVehicle.purchasePrice")} ({currencySymbol})
            </AppInputLabel>
          }
          AppInputField={
            <AppInputField
              placeholder={t("addVehicle.purchasePricePlaceholder")}
              value={formik.values.purchasePrice ? formik.values.purchasePrice.toString() : ""}
              onChangeText={handlePurchasePriceChange}
              onBlur={formik.handleBlur("purchasePrice")}
              keyboardType="numeric"
              InputLeftAction={
                <AppInputLeftAction>
                  <AppIcon icon="Banknote" size={20} color={theme.mutedForeground} />
                </AppInputLeftAction>
              }
            />
          }
          AppInputErrorMessage={
            <AppInputErrorMessage>
              {formik.touched.purchasePrice && formik.errors.purchasePrice}
            </AppInputErrorMessage>
          }
      />

      {/* Distance at Purchase */}
      <AppInput
        AppInputLabel={
          <AppInputLabel>
            {t("addVehicle.purchaseKm")} ({distanceLabel})
          </AppInputLabel>
        }
        AppInputField={
          <AppInputField
            placeholder={t("addVehicle.purchaseKmPlaceholder")}
            value={formik.values.purchaseKm ? formik.values.purchaseKm.toString() : ""}
            onChangeText={handlePurchaseKmChange}
            onBlur={formik.handleBlur("purchaseKm")}
            keyboardType="numeric"
            InputLeftAction={
              <AppInputLeftAction>
                <AppIcon icon="History" size={20} color={theme.mutedForeground} />
              </AppInputLeftAction>
            }
          />
        }
        AppInputErrorMessage={
          <AppInputErrorMessage>
            {formik.touched.purchaseKm && formik.errors.purchaseKm}
          </AppInputErrorMessage>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: spacing.lg,
  },
});
