import { useState, useCallback, useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores/root.store";
import { AppWizard, type WizardStep } from "@/components/ui/app-wizard";
import { appToast } from "@/components/ui/app-toast";
import {
  vehicleBrandModelValidator,
  vehicleModelModelValidator,
  VehicleImageType,
} from "@garagely/shared/models/vehicle";
import { bool, date, number, object, string } from "yup";
import { Formik, useFormikContext } from "formik";
import { BrandModelStep } from "./steps/brand-model-step/brand-model-step";
import { SpecsStep } from "./steps/specs-step/specs-step";
import { DetailsStep } from "./steps/details-step/details-step";
import { OdometerStep } from "./steps/odometer-step/odometer-step";
import { PhotoStep } from "./steps/photo-step/photo-step";

// Map form view types to SDK VehicleImageType
const VIEW_TYPE_TO_IMAGE_TYPE: Record<string, VehicleImageType> = {
  interior: VehicleImageType.INTERIOR,
  rear: VehicleImageType.BACK,
  side: VehicleImageType.SIDE,
  front: VehicleImageType.FRONT,
  engine: VehicleImageType.MOTOR,
  wheels: VehicleImageType.TIRES,
  other: VehicleImageType.OTHER,
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store actions
  const createVehicle = useStore((state) => state.vehicle.createVehicle);
  const upsertBrandAndModel = useStore(
    (state) => state.vehicle.upsertBrandAndModel,
  );
  const uploadImage = useStore((state) => state.vehicle.uploadImage);

  // Complete handler
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    console.log("[AddVehicle] === Starting handleComplete ===");

    try {
      const values = formik.values;
      console.log("[AddVehicle] Form values:", JSON.stringify(values, null, 2));

      let brandId = values.selectedBrand;
      let modelId = values.selectedModel;

      // Step 1: If custom entry, create brand/model first
      if (values.isCustomEntry) {
        console.log("[AddVehicle] Step 1: Creating custom brand/model...");
        const upsertPayload = {
          brand: { name: values.customBrandName },
          model: {
            name: values.customModelName,
            year: values.customYear ?? null,
          },
        };
        console.log("[AddVehicle] Upsert payload:", JSON.stringify(upsertPayload));

        const result = await upsertBrandAndModel(upsertPayload);
        console.log("[AddVehicle] Upsert result:", JSON.stringify(result));

        if (!result) {
          console.error("[AddVehicle] ERROR: Failed to create brand/model - result is null/undefined");
          appToast.error(t("addVehicle.errors.createModelFailed"));
          setIsSubmitting(false);
          return;
        }

        brandId = result.brand.id;
        modelId = result.model.id;
        console.log("[AddVehicle] Created brandId:", brandId, "modelId:", modelId);
      }

      // Step 2: Create vehicle
      console.log("[AddVehicle] Step 2: Creating vehicle...");
      const vehiclePayload = {
        vehicleBrandId: brandId,
        vehicleModelId: modelId,
        vehicleFuelTypeId: values.fuelTypeId!,
        vehicleTransmissionTypeId: values.transmissionTypeId!,
        vehicleBodyTypeId: values.bodyTypeId!,
        plate: values.plate || null,
        vin: values.vin || null,
        color: values.color || null,
        currentKm: values.currentKm || null,
        purchaseDate: values.purchaseDate || null,
        purchasePrice: values.purchasePrice || null,
        purchaseKm: values.purchaseKm || null,
      };
      console.log("[AddVehicle] Vehicle payload:", JSON.stringify(vehiclePayload));

      const vehicle = await createVehicle(vehiclePayload);
      console.log("[AddVehicle] Create vehicle result:", JSON.stringify(vehicle));

      if (!vehicle) {
        console.error("[AddVehicle] ERROR: Failed to create vehicle - vehicle is null/undefined");
        appToast.error(t("addVehicle.errors.createFailed"));
        setIsSubmitting(false);
        return;
      }

      // Step 3: Upload images
      console.log("[AddVehicle] Step 3: Uploading images...");
      const uploadPromises: Promise<unknown>[] = [];

      // Upload cover photo
      if (values.coverPhotoUri) {
        console.log("[AddVehicle] Adding cover photo upload:", values.coverPhotoUri);
        uploadPromises.push(
          uploadImage(vehicle.id, VehicleImageType.COVER, values.coverPhotoUri),
        );
      }

      // Upload additional photos
      Object.entries(values.additionalPhotos).forEach(([viewType, uri]) => {
        if (uri && VIEW_TYPE_TO_IMAGE_TYPE[viewType]) {
          console.log("[AddVehicle] Adding", viewType, "photo upload:", uri);
          uploadPromises.push(
            uploadImage(vehicle.id, VIEW_TYPE_TO_IMAGE_TYPE[viewType], uri),
          );
        }
      });

      // Wait for all uploads (don't fail if some uploads fail)
      if (uploadPromises.length > 0) {
        console.log("[AddVehicle] Waiting for", uploadPromises.length, "image uploads...");
        const uploadResults = await Promise.allSettled(uploadPromises);
        console.log("[AddVehicle] Upload results:", JSON.stringify(uploadResults));

        // Log any failed uploads
        uploadResults.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error("[AddVehicle] Upload", index, "failed:", result.reason);
          }
        });
      } else {
        console.log("[AddVehicle] No images to upload");
      }

      // Success
      console.log("[AddVehicle] === SUCCESS ===");
      appToast.success(t("addVehicle.success"));
      router.back();
    } catch (error) {
      console.error("[AddVehicle] === CAUGHT ERROR ===");
      console.error("[AddVehicle] Error:", error);
      console.error("[AddVehicle] Error message:", (error as Error)?.message);
      console.error("[AddVehicle] Error stack:", (error as Error)?.stack);
      appToast.error(t("addVehicle.errors.createFailed"));
    } finally {
      setIsSubmitting(false);
      console.log("[AddVehicle] === handleComplete finished ===");
    }
  }, [
    formik.values,
    createVehicle,
    upsertBrandAndModel,
    uploadImage,
    t,
    router,
  ]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  // Validation helpers
  const canProceedStep1 = useCallback(async () => {
    if (formik.values.isCustomEntry) {
      formik.setFieldTouched("customBrandName", true);
      formik.setFieldTouched("customModelName", true);
      formik.setFieldTouched("customYear", true);
      await Promise.all([
        formik.validateField("customBrandName"),
        formik.validateField("customModelName"),
        formik.validateField("customYear"),
      ]);
      return (
        !!formik.values.customBrandName &&
        !!formik.values.customModelName &&
        !!formik.values.customYear
      );
    }
    formik.setFieldTouched("selectedBrand", true);
    formik.setFieldTouched("selectedModel", true);
    await Promise.all([
      formik.validateField("selectedBrand"),
      formik.validateField("selectedModel"),
    ]);
    return !!formik.values.selectedBrand && !!formik.values.selectedModel;
  }, [formik]);

  const canProceedStep2 = useCallback(async () => {
    formik.setFieldTouched("fuelTypeId", true);
    formik.setFieldTouched("transmissionTypeId", true);
    formik.setFieldTouched("bodyTypeId", true);
    await Promise.all([
      formik.validateField("fuelTypeId"),
      formik.validateField("transmissionTypeId"),
      formik.validateField("bodyTypeId"),
    ]);
    return (
      !!formik.values.fuelTypeId &&
      !!formik.values.transmissionTypeId &&
      !!formik.values.bodyTypeId
    );
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
      completeLabel={t("addVehicle.createVehicle")}
      isSubmitting={isSubmitting}
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
