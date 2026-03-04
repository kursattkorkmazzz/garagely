import { useState, useCallback, useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores/root.store";
import { appToast } from "@/components/ui/app-toast";
import { AppWizard, type WizardStep } from "@/components/ui/app-wizard";
import { BrandModelStep } from "./steps/brand-model-step";
import { SpecsStep } from "./steps/specs-step";
import { DetailsStep } from "./steps/details-step";
import { OdometerStep } from "./steps/odometer-step";
import { PhotoStep } from "./steps/photo-step";
import {
  vehicleBrandModelValidator,
  vehicleModelModelValidator,
} from "@garagely/shared/models/vehicle";
import { bool, date, InferType, number, object, string } from "yup";
import { Formik } from "formik";

const AddVehicleStepValidators = [
  object({
    // Step 1: Brand & Model
    selectedBrand: vehicleBrandModelValidator.nullable(),
    selectedModel: vehicleModelModelValidator.nullable(),
    customBrandName: string(),
    customModelName: string(),
    isCustomEntry: bool(),
  }),

  object({
    // Step 2: Specs
    fuelTypeId: string().nullable(),
    transmissionTypeId: string().nullable(),
    bodyTypeId: string().nullable(),
  }),

  object({
    // Step 3: Details
    plate: string().required(),
    vin: string(),
    color: string(),
  }),

  object({
    // Step 4: Odometer & Purchase
    currentKm: number().nullable(),
    purchaseDate: date().nullable(),
    purchasePrice: number().nullable(),
    purchaseKm: number().nullable(),
  }),

  object({
    // Step 5: Photo
    photoUri: string().nullable(),
  }),
];

type AddVehicleFormState = InferType<(typeof AddVehicleStepValidators)[number]>;

const initialFormState: AddVehicleFormState = {
  selectedBrand: null,
  selectedModel: null,
  customBrandName: "",
  customModelName: "",
  isCustomEntry: false,
  fuelTypeId: null,
  transmissionTypeId: null,
  bodyTypeId: null,

  plate: "",
  color: "",
  vin: "",
  currentKm: 0,
  purchasePrice: 0,
  purchaseKm: 0,
  purchaseDate: null,
  photoUri: null,
};

export function AddVehicleWizard() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Validation helpers
  const canProceedStep1 = useCallback(() => {
    return true;
  }, []);

  const canProceedStep2 = useCallback(() => {
    return true;
  }, []);

  // Complete handler
  const handleComplete = useCallback(async () => {}, []);

  // Cancel handler
  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  // Define wizard steps
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "brand-model",
        title: t("addVehicle.steps.brandModel.title"),
        subtitle: t("addVehicle.steps.brandModel.subtitle"),
        content: <BrandModelStep />,
        canProceed: canProceedStep1,
      },
      {
        id: "specs",
        title: t("addVehicle.steps.specs.title"),
        subtitle: t("addVehicle.steps.specs.subtitle"),
        content: (
          <SpecsStep
            selectedFuelTypeId={formState.fuelTypeId}
            selectedTransmissionTypeId={formState.transmissionTypeId}
            selectedBodyTypeId={formState.bodyTypeId}
            onFuelTypeSelect={handleFuelTypeSelect}
            onTransmissionTypeSelect={handleTransmissionTypeSelect}
            onBodyTypeSelect={handleBodyTypeSelect}
          />
        ),
        canProceed: canProceedStep2,
      },
      {
        id: "details",
        title: t("addVehicle.steps.details.title"),
        subtitle: t("addVehicle.steps.details.subtitle"),
        content: (
          <DetailsStep
            plate={formState.plate}
            vin={formState.vin}
            color={formState.color}
            onPlateChange={handlePlateChange}
            onVinChange={handleVinChange}
            onColorChange={handleColorChange}
          />
        ),
        canProceed: true, // Optional step
      },
      {
        id: "odometer",
        title: t("addVehicle.steps.odometer.title"),
        subtitle: t("addVehicle.steps.odometer.subtitle"),
        content: (
          <OdometerStep
            currentKm={formState.currentKm}
            purchaseDate={formState.purchaseDate}
            purchasePrice={formState.purchasePrice}
            purchaseKm={formState.purchaseKm}
            onCurrentKmChange={handleCurrentKmChange}
            onPurchaseDateChange={handlePurchaseDateChange}
            onPurchasePriceChange={handlePurchasePriceChange}
            onPurchaseKmChange={handlePurchaseKmChange}
          />
        ),
        canProceed: true, // Optional step
      },
      {
        id: "photo",
        title: t("addVehicle.steps.photo.title"),
        subtitle: t("addVehicle.steps.photo.subtitle"),
        content: (
          <PhotoStep
            photoUri={formState.photoUri}
            onPhotoChange={handlePhotoChange}
          />
        ),
        canProceed: !isCreating && !isUploadingCover,
      },
    ],
    [
      t,
      formState,
      handleBrandSelect,
      handleModelSelect,
      handleCustomBrandNameChange,
      handleCustomModelNameChange,
      handleCustomEntryChange,
      handleFuelTypeSelect,
      handleTransmissionTypeSelect,
      handleBodyTypeSelect,
      handlePlateChange,
      handleVinChange,
      handleColorChange,
      handleCurrentKmChange,
      handlePurchaseDateChange,
      handlePurchasePriceChange,
      handlePurchaseKmChange,
      handlePhotoChange,
      canProceedStep1,
      canProceedStep2,
      isCreating,
      isUploadingCover,
    ],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Formik
        initialValues={initialFormState}
        validationSchema={AddVehicleStepValidators[currentStepIndex]}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        <AppWizard
          steps={steps}
          onComplete={handleComplete}
          onCancel={handleCancel}
          completeLabel={t("addVehicle.createVehicle")}
          onStepChange={setCurrentStepIndex}
        />
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
