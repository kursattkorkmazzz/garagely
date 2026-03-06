import { useState, useCallback, useMemo, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppWizard, type WizardStep } from "@/components/ui/app-wizard";
import {
  vehicleBrandModelValidator,
  vehicleModelModelValidator,
} from "@garagely/shared/models/vehicle";
import { bool, date, number, object, string } from "yup";
import { Formik, useFormikContext } from "formik";
import { BrandModelStep } from "./steps/brand-model-step/brand-model-step";
import { SpecsStep } from "./steps/specs-step/specs-step";
import { DetailsStep } from "./steps/details-step/details-step";
import { OdometerStep } from "./steps/odometer-step/odometer-step";
import { PhotoStep } from "./steps/photo-step/photo-step";

const createAddVehicleValidator = (t: (key: string) => string) =>
  object({
    // Step 1: Brand & Model
    selectedBrand: vehicleBrandModelValidator,
    selectedModel: vehicleModelModelValidator,
    customBrandName: string().required(
      t("addVehicle.validation.brandNameRequired"),
    ),
    customModelName: string().required(
      t("addVehicle.validation.modelNameRequired"),
    ),
    customYear: number().required(t("addVehicle.validation.yearRequired")),
    isCustomEntry: bool(),

    // Step 2: Specs
    fuelTypeId: string().required(t("addVehicle.validation.fuelTypeRequired")),
    transmissionTypeId: string().required(
      t("addVehicle.validation.transmissionRequired"),
    ),
    bodyTypeId: string().required(t("addVehicle.validation.bodyTypeRequired")),

    // Step 3: Details
    plate: string().required(t("addVehicle.validation.plateRequired")),
    vin: string(),
    color: string(),

    // Step 4: Odometer & Purchase
    currentKm: number().nullable(),
    purchaseDate: date().nullable(),
    purchasePrice: number().nullable(),
    purchaseKm: number().nullable(),

    // Step 5: Photos
    coverPhotoUri: string().nullable(),
    additionalPhotos: object({
      interior: string().nullable(),
      rear: string().nullable(),
      side: string().nullable(),
      front: string().nullable(),
      engine: string().nullable(),
      wheels: string().nullable(),
      other: string().nullable(),
    }),
  });
export type AddVehicleFormState = {
  selectedBrand: string;
  selectedModel: string;
  customBrandName: string;
  customModelName: string;
  customYear: number | undefined;
  isCustomEntry: boolean;

  fuelTypeId: string | undefined;
  transmissionTypeId: string | undefined;
  bodyTypeId: string | null;

  plate: string | null;
  color: string | null;
  vin: string | null;
  currentKm: number;
  purchasePrice: number;
  purchaseKm: number;
  purchaseDate: Date | null;
  coverPhotoUri: string | null;
  additionalPhotos: {
    interior: string | null;
    rear: string | null;
    side: string | null;
    front: string | null;
    engine: string | null;
    wheels: string | null;
    other: string | null;
  };
};

const initialFormState: AddVehicleFormState = {
  selectedBrand: "",
  selectedModel: "",
  customBrandName: "",
  customModelName: "",
  customYear: undefined,

  isCustomEntry: true,
  fuelTypeId: undefined,
  transmissionTypeId: undefined,
  bodyTypeId: null,

  plate: "",
  color: "",
  vin: "",
  currentKm: 0,
  purchasePrice: 0,
  purchaseKm: 0,
  purchaseDate: null,
  coverPhotoUri: null,
  additionalPhotos: {
    interior: null,
    rear: null,
    side: null,
    front: null,
    engine: null,
    wheels: null,
    other: null,
  },
};

export function AddVehicleForm() {
  const { t } = useI18n();
  const router = useRouter();
  const formik = useFormikContext<AddVehicleFormState>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Complete handler
  const handleComplete = useCallback(async () => {
    console.log("Values");
    if (formik.isValid) {
      console.log("No Problem");
    } else {
      console.log("Problemo");
    }
    console.log(formik.values);
  }, []);

  // Cancel handler
  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  // Validation helpers
  const canProceedStep1 = useCallback(async () => {
    if (formik.values.isCustomEntry) {
      return (
        !formik.errors.customBrandName &&
        !formik.errors.customModelName &&
        !formik.errors.customYear &&
        formik.dirty
      );
    }
    return (
      !formik.errors.selectedBrand &&
      !formik.errors.selectedModel &&
      formik.dirty
    );
  }, [formik]);

  const canProceedStep2 = useCallback(async () => {
    if (
      !formik.errors.bodyTypeId &&
      !formik.errors.fuelTypeId &&
      !formik.errors.transmissionTypeId &&
      formik.dirty
    )
      return true;

    return false;
  }, [formik]);

  const canProceedStep3 = useCallback(async () => {
    formik.setFieldTouched("plate", true);
    await formik.validateField("plate");
    return !formik.errors.plate && !!formik.values.plate;
  }, [formik]);

  const canProceedStep4 = useCallback(async () => {
    // Step 4 is optional, always allow proceeding
    return true;
  }, []);

  const canProceedStep5 = useCallback(async () => {
    // Step 5 is optional, always allow proceeding
    return true;
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
        content: <SpecsStep />,
        canProceed: canProceedStep2,
      },
      {
        id: "vehicle-details",
        title: t("addVehicle.steps.details.title"),
        subtitle: t("addVehicle.steps.details.subtitle"),
        content: <DetailsStep />,
        canProceed: canProceedStep3,
      },
      {
        id: "odometer-purchase",
        title: t("addVehicle.steps.odometer.title"),
        subtitle: t("addVehicle.steps.odometer.subtitle"),
        content: <OdometerStep />,
        canProceed: canProceedStep4,
      },
      {
        id: "photos",
        title: t("addVehicle.steps.photo.title"),
        subtitle: t("addVehicle.steps.photo.subtitle"),
        content: <PhotoStep />,
        canProceed: canProceedStep5,
      },
    ],
    [
      t,
      canProceedStep1,
      canProceedStep2,
      canProceedStep3,
      canProceedStep4,
      canProceedStep5,
    ],
  );

  return (
    <AppWizard
      steps={steps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      onStepChange={setCurrentStepIndex}
      completeLabel={t("addVehicle.createVehicle")}
    />
  );
}

export function AddVehicleWizard() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const validationSchema = useMemo(() => createAddVehicleValidator(t), [t]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Formik
        initialValues={initialFormState}
        onSubmit={(values) => {
          console.log(values);
        }}
        validationSchema={validationSchema}
        validateOnChange={true}
      >
        <AddVehicleForm />
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
