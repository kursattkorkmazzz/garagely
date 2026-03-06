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
import { bool, date, InferType, number, object, string } from "yup";
import { Formik, useFormik, useFormikContext } from "formik";
import { BrandModelStep } from "./steps/brand-model-step/brand-model-step";
import { SpecsStep } from "./steps/specs-step/specs-step";

const AddVehicleStepValidator = object({
  // Step 1: Brand & Model
  selectedBrand: vehicleBrandModelValidator,
  selectedModel: vehicleModelModelValidator,
  customBrandName: string().required("Bu alan zorunludur"),
  customModelName: string().required("Bu alan zorunludur"),
  customYear: number().required("Bu alan zorunludur"),
  isCustomEntry: bool(),

  // Step 2: Specs
  fuelTypeId: string().required("Bu alan zorunludur"),
  transmissionTypeId: string().nullable(),
  bodyTypeId: string().nullable(),

  // Step 3: Details
  plate: string().required(),
  vin: string(),
  color: string(),

  // Step 4: Odometer & Purchase
  currentKm: number().nullable(),
  purchaseDate: date().nullable(),
  purchasePrice: number().nullable(),
  purchaseKm: number().nullable(),

  // Step 5: Photo
  photoUri: string().nullable(),
});
export type AddVehicleFormState = {
  selectedBrand: string;
  selectedModel: string;
  customBrandName: string;
  customModelName: string;
  customYear: number | undefined;
  isCustomEntry: boolean;

  fuelTypeId: string | undefined;
  transmissionTypeId: string | null;
  bodyTypeId: string | null;

  plate: string | null;
  color: string | null;
  vin: string | null;
  currentKm: number;
  purchasePrice: number;
  purchaseKm: number;
  purchaseDate: Date | null;
  photoUri: string | null;
};

const initialFormState: AddVehicleFormState = {
  selectedBrand: "",
  selectedModel: "",
  customBrandName: "",
  customModelName: "",
  customYear: undefined,

  isCustomEntry: true,
  fuelTypeId: undefined,
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
  const canProceedStep1 = useCallback(() => {
    if (formik.values.isCustomEntry) {
      return (
        !formik.errors.customBrandName &&
        !formik.errors.customModelName &&
        !formik.errors.customYear
      );
    }
    return !formik.errors.selectedBrand && !formik.errors.selectedModel;
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
        title: "Specification",
        subtitle: "Specificatiob Sub Title",
        content: <SpecsStep />,
        canProceed: () => true,
      },
    ],
    [t, canProceedStep1],
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
        validationSchema={AddVehicleStepValidator}
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
