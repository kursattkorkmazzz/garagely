import { View, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppInput, InputField, InputLeftAction } from "@/components/ui/app-input";
import { AppIcon } from "@/components/ui/app-icon";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

// Common vehicle colors with their hex values
const vehicleColors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Silver", value: "#C0C0C0" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#DC2626" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#16A34A" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Orange", value: "#EA580C" },
  { name: "Brown", value: "#92400E" },
  { name: "Beige", value: "#D4A574" },
  { name: "Navy", value: "#1E3A5F" },
];

type DetailsStepProps = {
  plate: string;
  vin: string;
  color: string | null;
  onPlateChange: (value: string) => void;
  onVinChange: (value: string) => void;
  onColorChange: (value: string) => void;
};

export function DetailsStep({
  plate,
  vin,
  color,
  onPlateChange,
  onVinChange,
  onColorChange,
}: DetailsStepProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      {/* Skip hint */}
      <View style={[styles.hintContainer, { backgroundColor: withOpacity(theme.primary, 0.1) }]}>
        <AppIcon icon="Info" size={16} color={theme.primary} />
        <AppText variant="bodySmall" color="primary" style={styles.hintText}>
          {t("addVehicle.optionalStepHint")}
        </AppText>
      </View>

      {/* License Plate */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.licensePlate")}
        </AppText>
        <AppInput>
          <InputLeftAction>
            <AppIcon icon="CreditCard" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder={t("addVehicle.licensePlatePlaceholder")}
            value={plate}
            onChangeText={onPlateChange}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </AppInput>
      </View>

      {/* VIN */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.vin")}
        </AppText>
        <AppInput>
          <InputLeftAction>
            <AppIcon icon="Hash" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder={t("addVehicle.vinPlaceholder")}
            value={vin}
            onChangeText={onVinChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={17}
          />
        </AppInput>
        <AppText variant="caption" color="muted" style={styles.fieldHint}>
          {t("addVehicle.vinHint")}
        </AppText>
      </View>

      {/* Color Picker */}
      <View style={styles.field}>
        <AppText variant="bodyMedium" style={styles.fieldLabel}>
          {t("addVehicle.color")}
        </AppText>
        <View style={styles.colorGrid}>
          {vehicleColors.map((c) => {
            const isSelected = color === c.value;
            const isLight = c.value === "#FFFFFF" || c.value === "#C0C0C0";

            return (
              <Pressable
                key={c.value}
                onPress={() => onColorChange(c.value)}
                style={({ pressed }) => [
                  styles.colorItem,
                  {
                    backgroundColor: c.value,
                    borderColor: isSelected
                      ? theme.primary
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
        </View>
        {color && (
          <Pressable
            onPress={() => onColorChange("")}
            style={styles.clearColorButton}
          >
            <AppText variant="bodySmall" color="muted">
              {t("addVehicle.clearColor")}
            </AppText>
          </Pressable>
        )}
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
  fieldHint: {
    marginTop: spacing.xs,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  clearColorButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
});
