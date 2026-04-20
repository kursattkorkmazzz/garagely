import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppButton } from "@/components/ui/app-button";
import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
  AppInputText,
} from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { Vehicle } from "@/features/vehicle/entity/vehicle.entity";
import { VehicleService } from "@/features/vehicle/service/vehicle.service";
import { useI18n } from "@/i18n";
import { CurrencyType, CurrencyTypes } from "@/shared/currency";
import { BodyType, BodyTypes } from "@/shared/enums/body-type";
import { FuelType, FuelTypes } from "@/shared/enums/fuel-type";
import {
  TransmissionType,
  TransmissionTypes,
} from "@/shared/enums/transmission-type";
import { useVehicleStore } from "@/stores/vehicle.store";
import { router } from "expo-router";
import { Formik, useFormikContext } from "formik";
import { ChevronRight } from "lucide-react-native/icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { vehicleFormSchema } from "./vehicle-form.schema";
import { VEHICLE_FORM_EMPTY, VehicleFormValues } from "./vehicle-form.types";

type VehicleFormScreenProps = {
  id: string;
};

export function VehicleFormScreen({ id }: VehicleFormScreenProps) {
  const isNew = id === "new";
  const [initialValues, setInitialValues] =
    useState<VehicleFormValues>(VEHICLE_FORM_EMPTY);
  const [loadingVehicle, setLoadingVehicle] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    VehicleService.getById(id).then((vehicle) => {
      if (vehicle) setInitialValues(vehicleToFormValues(vehicle));
      setLoadingVehicle(false);
    });
  }, [id]);

  const { create, update } = useVehicleStore();

  const handleSubmit = async (values: VehicleFormValues) => {
    const dto = formValuesToDto(values);
    if (isNew) {
      await create(dto);
    } else {
      await update(id, dto);
    }
    router.back();
  };

  if (loadingVehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={vehicleFormSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      <VehicleFormFields />
    </Formik>
  );
}

function VehicleFormFields() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
    isSubmitting,
  } = useFormikContext<VehicleFormValues>();
  const { t } = useI18n("vehicle");
  const { theme } = useUnistyles();

  const showEnumSheet = <T extends string>(
    titleKey: string,
    options: Record<string, T>,
    translationKey: keyof typeof options,
    fieldName: keyof VehicleFormValues,
    currentValue: string,
  ) => {
    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            title: "", //TODO: Başlık eklenecek.
            data: (Object.values(options) as T[]).map((value) => ({
              key: value,
              label: t(`${titleKey}.${value}`),
              isSelected: currentValue === value,
              onSelectItem: () => {
                setFieldValue(fieldName as string, value);
                SheetManager.hide("select-sheet");
              },
            })),
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            selected={item.isSelected as boolean}
            onPress={item.onSelectItem as () => void}
          />
        ),
      },
    });
  };

  const showFuelTypeSheet = () =>
    showEnumSheet(
      "fuelType",
      FuelTypes,
      "fuelType",
      "fuelType",
      values.fuelType,
    );

  const showTransmissionSheet = () =>
    showEnumSheet(
      "transmissionType",
      TransmissionTypes,
      "transmissionType",
      "transmissionType",
      values.transmissionType,
    );

  const showBodyTypeSheet = () =>
    showEnumSheet(
      "bodyType",
      BodyTypes,
      "bodyType",
      "bodyType",
      values.bodyType,
    );

  const showCurrencySheet = () =>
    showEnumSheet(
      "currency",
      CurrencyTypes,
      "currency",
      "purchaseCurrency",
      values.purchaseCurrency,
    );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Basic Info */}
      <AppText style={styles.sectionHeader}>{t("sections.basicInfo")}</AppText>
      <View style={styles.fieldGroup}>
        <FormField
          label={t("fields.brand")}
          placeholder={t("placeholders.brand")}
          value={values.brand}
          onChangeText={handleChange("brand")}
          onBlur={handleBlur("brand")}
          error={touched.brand ? errors.brand : undefined}
          autoCapitalize="words"
        />
        <FormField
          label={t("fields.model")}
          placeholder={t("placeholders.model")}
          value={values.model}
          onChangeText={handleChange("model")}
          onBlur={handleBlur("model")}
          error={touched.model ? errors.model : undefined}
          autoCapitalize="words"
        />
        <FormField
          label={t("fields.year")}
          placeholder={t("placeholders.year")}
          value={values.year}
          onChangeText={handleChange("year")}
          onBlur={handleBlur("year")}
          error={touched.year ? errors.year : undefined}
          keyboardType="number-pad"
          maxLength={4}
        />
        <FormField
          label={t("fields.plate")}
          placeholder={t("placeholders.plate")}
          value={values.plate}
          onChangeText={handleChange("plate")}
          onBlur={handleBlur("plate")}
          error={touched.plate ? errors.plate : undefined}
          autoCapitalize="characters"
        />
        <FormField
          label={t("fields.color")}
          placeholder={t("placeholders.color")}
          value={values.color}
          onChangeText={handleChange("color")}
          onBlur={handleBlur("color")}
          error={touched.color ? errors.color : undefined}
          autoCapitalize="words"
        />
      </View>

      {/* Vehicle Details */}
      <AppText style={styles.sectionHeader}>
        {t("sections.vehicleDetails")}
      </AppText>
      <View style={styles.fieldGroup}>
        <EnumPickerRow
          label={t("fields.fuelType")}
          value={values.fuelType ? t(`fuelType.${values.fuelType}`) : ""}
          error={touched.fuelType ? errors.fuelType : undefined}
          onPress={showFuelTypeSheet}
        />
        <EnumPickerRow
          label={t("fields.transmissionType")}
          value={
            values.transmissionType
              ? t(`transmissionType.${values.transmissionType}`)
              : ""
          }
          error={touched.transmissionType ? errors.transmissionType : undefined}
          onPress={showTransmissionSheet}
        />
        <EnumPickerRow
          label={t("fields.bodyType")}
          value={values.bodyType ? t(`bodyType.${values.bodyType}`) : ""}
          error={touched.bodyType ? errors.bodyType : undefined}
          onPress={showBodyTypeSheet}
        />
      </View>

      {/* Purchase Info */}
      <AppText style={styles.sectionHeader}>
        {t("sections.purchaseInfo")}
      </AppText>
      <View style={styles.fieldGroup}>
        <View style={styles.fieldWrapper}>
          <AppText style={styles.fieldLabel}>
            {t("fields.purchaseAmount")}
          </AppText>
          <AppInputGroup
            error={!!(touched.purchaseAmount && errors.purchaseAmount)}
          >
            <AppInputField
              placeholder={t("placeholders.purchaseAmount")}
              value={values.purchaseAmount}
              onChangeText={handleChange("purchaseAmount")}
              onBlur={handleBlur("purchaseAmount")}
              keyboardType="numeric"
            />
            <AppInputAddon position="right">
              <Pressable
                onPress={showCurrencySheet}
                style={styles.currencyAddon}
              >
                <AppInputText>
                  {values.purchaseCurrency || CurrencyTypes.TRY}
                </AppInputText>
                <ChevronRight size={12} color={theme.colors.mutedForeground} />
              </Pressable>
            </AppInputAddon>
          </AppInputGroup>
          {touched.purchaseAmount && errors.purchaseAmount ? (
            <AppText style={styles.errorText}>{errors.purchaseAmount}</AppText>
          ) : null}
        </View>

        <View style={styles.fieldWrapper}>
          <AppText style={styles.fieldLabel}>
            {t("fields.purchaseDate")}
          </AppText>
          <AppInputGroup>
            <AppInputField placeholder="— (coming soon)" editable={false} />
          </AppInputGroup>
        </View>
      </View>

      <AppButton
        variant="primary"
        size="lg"
        loading={isSubmitting}
        onPress={() => handleSubmit()}
        style={styles.submitButton}
      >
        {t("addVehicle")}
      </AppButton>
    </ScrollView>
  );
}

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: (e: unknown) => void;
  error?: string;
  [key: string]: unknown;
};

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  ...rest
}: FormFieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <AppInputGroup error={!!error}>
        <AppInputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur as () => void}
          {...rest}
        />
      </AppInputGroup>
      {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
    </View>
  );
}

type EnumPickerRowProps = {
  label: string;
  value: string;
  error?: string;
  onPress: () => void;
};

function EnumPickerRow({ label, value, error, onPress }: EnumPickerRowProps) {
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
          {value || "Select..."}
        </AppText>
        <ChevronRight size={16} color={theme.colors.muted} />
      </Pressable>
      {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
    </View>
  );
}

function vehicleToFormValues(v: Vehicle): VehicleFormValues {
  return {
    brand: v.brand,
    model: v.model,
    year: String(v.year),
    plate: v.plate,
    color: v.color,
    transmissionType: v.transmissionType,
    bodyType: v.bodyType,
    fuelType: v.fuelType,
    purchaseAmount: v.purchase?.amount ? String(v.purchase.amount) : "",
    purchaseCurrency: v.purchase?.currency ?? "",
    purchaseDate: v.purchaseDate ?? null,
  };
}

function formValuesToDto(values: VehicleFormValues) {
  return {
    brand: values.brand,
    model: values.model,
    year: Number(values.year),
    plate: values.plate,
    color: values.color,
    transmissionType: values.transmissionType as TransmissionType,
    bodyType: values.bodyType as BodyType,
    fuelType: values.fuelType as FuelType,
    purchase: values.purchaseAmount
      ? {
          amount: Number(values.purchaseAmount),
          currency: (values.purchaseCurrency || undefined) as
            | CurrencyType
            | undefined,
        }
      : undefined,
    purchaseDate: values.purchaseDate ?? undefined,
  };
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  sectionHeader: {
    ...theme.typography.overline,
    color: theme.colors.mutedForeground,
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    textTransform: "uppercase" as const,
  },
  fieldGroup: {
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    gap: 0,
  },
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
  currencyAddon: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.xxs,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.destructive,
  },
  submitButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
}));
