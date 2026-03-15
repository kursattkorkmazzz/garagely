import { useState } from "react";
import { ScrollView, StyleSheet, Pressable, View } from "react-native";
import { useFormikContext } from "formik";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import { AppView } from "@/components/ui/app-view";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import {
  AppInput,
  AppInputField,
  AppInputLabel,
  AppInputErrorMessage,
  AppInputRightAction,
} from "@/components/ui/app-input-v2";
import type { VehicleWizardCommonFields } from "../../../types/vehicle-form.types";

const VEHICLE_COLORS = [
  { id: "white", value: "#FFFFFF" },
  { id: "black", value: "#000000" },
  { id: "silver", value: "#C0C0C0" },
  { id: "gray", value: "#808080" },
  { id: "red", value: "#DC2626" },
  { id: "blue", value: "#2563EB" },
  { id: "navy", value: "#1E3A5F" },
  { id: "green", value: "#16A34A" },
  { id: "yellow", value: "#EAB308" },
  { id: "orange", value: "#EA580C" },
  { id: "brown", value: "#78350F" },
  { id: "beige", value: "#D4B896" },
];

const INITIAL_VISIBLE_COUNT = 5;

export function DetailsStep() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext<VehicleWizardCommonFields>();
  const [showAllColors, setShowAllColors] = useState(false);

  const visibleColors = showAllColors
    ? VEHICLE_COLORS
    : VEHICLE_COLORS.slice(0, INITIAL_VISIBLE_COUNT);

  const handleColorSelect = (colorValue: string) => {
    if (formik.values.color === colorValue) {
      formik.setFieldValue("color", null);
    } else {
      formik.setFieldValue("color", colorValue);
    }
  };

  const isLightColor = (hex: string) => {
    return hex === "#FFFFFF" || hex === "#C0C0C0" || hex === "#EAB308" || hex === "#D4B896";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Plate Number */}
      <AppInput
        AppInputLabel={
          <AppInputLabel>{t("addVehicle.licensePlate")}</AppInputLabel>
        }
        AppInputField={
          <AppInputField
            placeholder={t("addVehicle.licensePlatePlaceholder")}
            value={formik.values.plate || ""}
            onChangeText={formik.handleChange("plate")}
            onBlur={formik.handleBlur("plate")}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        }
        AppInputErrorMessage={
          <AppInputErrorMessage>
            {formik.touched.plate && formik.errors.plate}
          </AppInputErrorMessage>
        }
      />

      {/* VIN */}
      <AppView style={styles.fieldContainer}>
        <AppView style={styles.labelRow}>
          <AppText variant="bodyMedium" color="muted" style={styles.label}>
            {t("addVehicle.vin")}
          </AppText>
          <Pressable
            onPress={() => {
              // Could show a tooltip/modal with VIN info
            }}
          >
            <AppIcon icon="Info" size={18} color={theme.mutedForeground} />
          </Pressable>
        </AppView>
        <AppInput
          AppInputField={
            <AppInputField
              placeholder={t("addVehicle.vinPlaceholder")}
              value={formik.values.vin || ""}
              onChangeText={formik.handleChange("vin")}
              onBlur={formik.handleBlur("vin")}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={17}
            />
          }
          AppInputErrorMessage={
            <AppInputErrorMessage>
              {formik.touched.vin && formik.errors.vin}
            </AppInputErrorMessage>
          }
        />
      </AppView>

      {/* Vehicle Color */}
      <AppView style={styles.fieldContainer}>
        <AppView style={styles.labelRow}>
          <AppText variant="bodyMedium" color="muted" style={styles.label}>
            {t("addVehicle.color")}
          </AppText>
          <Pressable onPress={() => setShowAllColors(!showAllColors)}>
            <AppText variant="bodySmall" color="accent">
              {showAllColors
                ? t("addVehicle.lessColors")
                : t("addVehicle.moreColors")}
            </AppText>
          </Pressable>
        </AppView>

        <AppView style={styles.colorGrid}>
          {visibleColors.map((color) => {
            const isSelected = formik.values.color === color.value;
            const isLight = isLightColor(color.value);

            return (
              <Pressable
                key={color.id}
                onPress={() => handleColorSelect(color.value)}
                style={({ pressed }) => [
                  styles.colorSwatch,
                  {
                    backgroundColor: color.value,
                    borderColor: isSelected
                      ? theme.accent
                      : isLight
                        ? theme.border
                        : "transparent",
                    borderWidth: isSelected ? 3 : isLight ? 1 : 0,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {isSelected && (
                  <AppIcon
                    icon="Check"
                    size={20}
                    color={isLight ? theme.foreground : "#FFFFFF"}
                  />
                )}
              </Pressable>
            );
          })}
        </AppView>

        {formik.values.color && (
          <Pressable
            onPress={() => formik.setFieldValue("color", null)}
            style={styles.clearButton}
          >
            <AppText variant="bodySmall" color="muted">
              {t("addVehicle.clearColor")}
            </AppText>
          </Pressable>
        )}
      </AppView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldContainer: {
    marginTop: spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontWeight: "500",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 56,
    height: 40,
    borderRadius: radius * 2,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
});
