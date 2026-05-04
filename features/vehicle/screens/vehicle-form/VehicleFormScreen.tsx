import { AppColorPickerField } from "@/components/color-picker/app-color-picker-field";
import { EnumPickerRow } from "@/components/enum-picker-row/enum-picker-row";
import { MoneyInputField } from "@/components/money-input-field/money-input-field";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppButton } from "@/components/ui/app-button";
import { AppDateTimePickerField } from "@/components/ui/app-date-picker/app-date-time-picker-field";
import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldError } from "@/components/ui/app-field/app-field-error";
import { AppFieldGroup } from "@/components/ui/app-field/app-field-group";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import { AppInputField, AppInputGroup } from "@/components/ui/app-input";
import { VehicleCoverPhotoField } from "@/features/vehicle/components/VehicleCoverPhotoField";
import { Vehicle } from "@/features/vehicle/entity/vehicle.entity";
import { VehicleService } from "@/features/vehicle/service/vehicle.service";
import { useI18n } from "@/i18n";
import { APP_HEADER_HEIGHT } from "@/layouts/header/app-header";
import { CurrencyType } from "@/shared/currency";
import { BodyType, BodyTypes } from "@/shared/enums/body-type";
import { FuelType, FuelTypes } from "@/shared/enums/fuel-type";
import {
  TransmissionType,
  TransmissionTypes,
} from "@/shared/enums/transmission-type";
import { useGalleryStore } from "@/stores/gallery.store";
import { useVehicleStore } from "@/stores/vehicle.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { router } from "expo-router";
import { Formik, useFormikContext } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet } from "react-native-unistyles";
import { createVehicleFormSchema } from "./vehicle-form.schema";
import { VEHICLE_FORM_EMPTY, VehicleFormValues } from "./vehicle-form.types";

type VehicleFormScreenProps = {
  id: string;
};

export function VehicleFormScreen({ id }: VehicleFormScreenProps) {
  const isNew = id === "new";
  const { t } = useI18n("vehicle");
  const validationSchema = useMemo(() => createVehicleFormSchema(t), [t]);
  const [initialValues, setInitialValues] =
    useState<VehicleFormValues>(VEHICLE_FORM_EMPTY);
  const [loadingVehicle, setLoadingVehicle] = useState(!isNew);
  const previousCoverPhotoAssetIdRef = useRef<string | null>(null);

  const { create, update } = useVehicleStore();
  const galleryStore = useGalleryStore();

  useEffect(() => {
    if (isNew) return;
    VehicleService.getById(id).then((vehicle) => {
      if (vehicle) {
        setInitialValues(vehicleToFormValues(vehicle));
        previousCoverPhotoAssetIdRef.current =
          vehicle.coverPhotoAssetId ?? null;
      }
      setLoadingVehicle(false);
    });
  }, [id]);

  const handleSubmit = async (values: VehicleFormValues) => {
    const dto = formValuesToDto(values);
    if (isNew) {
      await create(dto)
        .then(() => {
          router.back();
        })
        .catch(handleUIError);
    } else {
      await update(id, dto)
        .then(() => {
          const oldId = previousCoverPhotoAssetIdRef.current;
          if (oldId && oldId !== values.coverPhotoAssetId) {
            Alert.alert(
              t("coverPhoto.keepOldTitle"),
              t("coverPhoto.keepOldMessage"),
              [
                {
                  text: t("coverPhoto.keepInGallery"),
                  style: "default",
                },
                {
                  text: t("coverPhoto.removeFromGallery"),
                  style: "destructive",
                  onPress: () =>
                    galleryStore.deleteAsset(oldId).catch(handleUIError),
                },
              ],
            );
          }
          router.back();
        })
        .catch(handleUIError);
    }
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
      validationSchema={validationSchema}
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
    setFieldTouched,
    handleSubmit,
    isSubmitting,
  } = useFormikContext<VehicleFormValues>();
  const { t } = useI18n("vehicle");

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
            title: "",
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

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={APP_HEADER_HEIGHT}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover Photo */}
        <AppFieldGroup label={t("sections.coverPhoto")}>
          <VehicleCoverPhotoField
            previewUri={values.coverPhotoPreviewUri}
            onUploadComplete={(assetId, previewUri) => {
              setFieldValue("coverPhotoAssetId", assetId);
              setFieldValue("coverPhotoPreviewUri", previewUri);
            }}
          />
        </AppFieldGroup>

        {/* Basic Info */}
        <AppFieldGroup label={t("sections.basicInfo")}>
          <VehicleFormField
            label={t("fields.brand")}
            placeholder={t("placeholders.brand")}
            value={values.brand}
            onChangeText={handleChange("brand")}
            onBlur={handleBlur("brand")}
            error={touched.brand ? errors.brand : undefined}
            autoCapitalize="words"
          />

          <VehicleFormField
            label={t("fields.model")}
            placeholder={t("placeholders.model")}
            value={values.model}
            onChangeText={handleChange("model")}
            onBlur={handleBlur("model")}
            error={touched.model ? errors.model : undefined}
            autoCapitalize="words"
          />

          <VehicleFormField
            label={t("fields.year")}
            placeholder={t("placeholders.year")}
            value={values.year}
            onChangeText={handleChange("year")}
            onBlur={handleBlur("year")}
            error={touched.year ? errors.year : undefined}
            keyboardType="number-pad"
            maxLength={4}
          />

          <VehicleFormField
            label={t("fields.plate")}
            placeholder={t("placeholders.plate")}
            value={values.plate}
            onChangeText={handleChange("plate")}
            onBlur={handleBlur("plate")}
            error={touched.plate ? errors.plate : undefined}
            autoCapitalize="characters"
          />

          <AppColorPickerField
            label={t("fields.color")}
            value={values.color}
            onChange={(hex) => {
              setFieldValue("color", hex);
              setFieldTouched("color", true, false);
            }}
            error={touched.color ? errors.color : undefined}
          />
        </AppFieldGroup>

        {/* Vehicle Details */}
        <AppFieldGroup label={t("sections.vehicleDetails")}>
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
            error={
              touched.transmissionType ? errors.transmissionType : undefined
            }
            onPress={showTransmissionSheet}
          />
          <EnumPickerRow
            label={t("fields.bodyType")}
            value={values.bodyType ? t(`bodyType.${values.bodyType}`) : ""}
            error={touched.bodyType ? errors.bodyType : undefined}
            onPress={showBodyTypeSheet}
          />
        </AppFieldGroup>

        {/* Purchase Info */}
        <AppFieldGroup label={t("sections.purchaseInfo")}>
          <MoneyInputField
            label={t("fields.purchaseAmount")}
            placeholder={t("placeholders.purchaseAmount")}
            value={values.purchaseAmount}
            onMoneyChange={(money) => {
              setFieldValue("purchaseAmount", money);
            }}
            onBlur={handleBlur("purchaseAmount")}
            selectedCurrency={values.purchaseCurrency as CurrencyType}
            onCurrencyChange={(currency) =>
              setFieldValue("purchaseCurrency", currency)
            }
            error={errors.purchaseAmount}
          />

          <AppDateTimePickerField
            label={t("fields.purchaseDate")}
            value={values.purchaseDate}
            onChange={(utcMs) => setFieldValue("purchaseDate", utcMs)}
            mode="date"
            error={touched.purchaseDate ? errors.purchaseDate : undefined}
          />
        </AppFieldGroup>

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
    </KeyboardAvoidingView>
  );
}

type VehicleFormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: (e: unknown) => void;
  error?: string;
  [key: string]: unknown;
};

function VehicleFormField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  ...rest
}: VehicleFormFieldProps) {
  return (
    <AppField>
      <AppFieldLabel>{label}</AppFieldLabel>
      <AppInputGroup>
        <AppInputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          {...rest}
        />
      </AppInputGroup>
      {error ? <AppFieldError>{error}</AppFieldError> : null}
    </AppField>
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
    coverPhotoAssetId: v.coverPhotoAssetId ?? null,
    coverPhotoPreviewUri: v.coverPhoto?.fullPath ?? null,
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
    coverPhotoAssetId: values.coverPhotoAssetId ?? undefined,
  };
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  submitButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
}));
