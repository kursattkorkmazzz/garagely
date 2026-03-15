import { useState, useCallback, useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { sdk } from "@/stores/sdk";
import { AppWizard, type WizardStep } from "@/components/ui/app-wizard";
import { appToast } from "@/components/ui/app-toast";
import {
  VehicleImageType,
  vehicleImageTypeToEntityType,
} from "@garagely/shared/models/vehicle";
import { createReactNativeFile } from "@/utils/file.utils";
import { getChangedVehicleFields } from "@/utils/form.utils";
import type {
  VehicleModel,
  DetailedVehicleModel,
} from "@garagely/shared/models/vehicle";
import type { UpdateVehiclePayload } from "@garagely/shared/payloads/vehicle";
import { date, number, object, string } from "yup";
import { Formik, useFormikContext } from "formik";
import { SpecsStep } from "../add-vehicle/steps/specs-step/specs-step";
import { DetailsStep } from "../add-vehicle/steps/details-step/details-step";
import { OdometerStep } from "../add-vehicle/steps/odometer-step/odometer-step";
import { PhotoStep } from "../add-vehicle/steps/photo-step/photo-step";
import { showApiError } from "@/utils/show-api-error";

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

const createEditVehicleValidator = (t: (key: string) => string) => {
  return object({
    // Specs (required)
    fuelTypeId: string().required(t("addVehicle.validation.fuelTypeRequired")),
    transmissionTypeId: string().required(
      t("addVehicle.validation.transmissionRequired"),
    ),
    bodyTypeId: string().required(t("addVehicle.validation.bodyTypeRequired")),

    // Details
    plate: string().required(t("addVehicle.validation.plateRequired")),
    vin: string().nullable(),
    color: string().nullable(),

    // Odometer & Purchase
    currentKm: number().nullable(),
    purchaseDate: date().nullable(),
    purchasePrice: number().nullable(),
    purchaseKm: number().nullable(),

    // Photos
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
};

export type EditVehicleFormState = {
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

// SDK wrapper functions
async function updateVehicle(
  vehicleId: string,
  payload: Partial<UpdateVehiclePayload>,
): Promise<VehicleModel | null> {
  return new Promise((resolve) => {
    sdk.vehicle.updateVehicle(vehicleId, payload, {
      onSuccess: (res) => resolve(res.data),
      onError: (err) => {
        showApiError(err);
        resolve(null);
      },
    });
  });
}

async function uploadVehicleImage(
  vehicleId: string,
  imageType: VehicleImageType,
  uri: string,
): Promise<boolean> {
  const entityType = vehicleImageTypeToEntityType[imageType];
  const file = createReactNativeFile(uri, entityType);
  return new Promise((resolve) => {
    sdk.vehicle.uploadImage(vehicleId, imageType, file, {
      onSuccess: () => resolve(true),
      onError: (err) => {
        showApiError(err);
        resolve(false);
      },
    });
  });
}

type EditVehicleFormProps = {
  vehicle: DetailedVehicleModel;
  originalData: {
    fuelTypeId: string;
    transmissionTypeId: string;
    bodyTypeId: string;
    plate: string | null;
    vin: string | null;
    color: string | null;
    purchaseDate: Date | null;
    purchasePrice: number | null;
    purchaseKm: number | null;
    coverPhotoUri: string | null;
    additionalPhotos: EditVehicleFormState["additionalPhotos"];
  };
};

function EditVehicleForm({ vehicle, originalData }: EditVehicleFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const formik = useFormikContext<EditVehicleFormState>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Complete handler
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const values = formik.values;

      // Get only changed fields
      const changes = getChangedVehicleFields(
        {
          fuelTypeId: originalData.fuelTypeId,
          transmissionTypeId: originalData.transmissionTypeId,
          bodyTypeId: originalData.bodyTypeId,
          plate: originalData.plate,
          vin: originalData.vin,
          color: originalData.color,
          purchaseDate: originalData.purchaseDate,
          purchasePrice: originalData.purchasePrice,
          purchaseKm: originalData.purchaseKm,
        },
        values,
      );

      // Only call update if there are changes
      if (Object.keys(changes).length > 0) {
        const result = await updateVehicle(vehicle.id, changes);
        if (!result) {
          setIsSubmitting(false);
          return;
        }
      }

      // Handle image uploads (only new images - those that are local URIs)
      const uploadPromises: Promise<boolean>[] = [];

      // Check if cover photo changed (local URI vs remote URL)
      if (
        values.coverPhotoUri &&
        values.coverPhotoUri !== originalData.coverPhotoUri &&
        !values.coverPhotoUri.startsWith("http")
      ) {
        uploadPromises.push(
          uploadVehicleImage(
            vehicle.id,
            VehicleImageType.COVER,
            values.coverPhotoUri,
          ),
        );
      }

      // Check additional photos
      Object.entries(values.additionalPhotos).forEach(([viewType, uri]) => {
        const originalUri =
          originalData.additionalPhotos[
            viewType as keyof typeof originalData.additionalPhotos
          ];
        if (
          uri &&
          uri !== originalUri &&
          !uri.startsWith("http") &&
          VIEW_TYPE_TO_IMAGE_TYPE[viewType]
        ) {
          uploadPromises.push(
            uploadVehicleImage(
              vehicle.id,
              VIEW_TYPE_TO_IMAGE_TYPE[viewType],
              uri,
            ),
          );
        }
      });

      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);
      }

      appToast.success(t("editVehicle.success"));
      router.back();
    } catch (error) {
      console.error("[EditVehicle] Error:", error);
      appToast.error(t("editVehicle.errors.updateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [formik.values, originalData, vehicle.id, t, router]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // Validation helpers
  const canProceedSpecs = useCallback(async () => {
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

  const canProceedDetails = useCallback(async () => {
    formik.setFieldTouched("plate", true);
    await formik.validateField("plate");
    return !formik.errors.plate && !!formik.values.plate;
  }, [formik]);

  const canProceedOdometer = useCallback(async () => {
    return true;
  }, []);

  const canProceedPhotos = useCallback(async () => {
    return true;
  }, []);

  // Define wizard steps (skip brand/model for edit)
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "specs",
        title: t("addVehicle.steps.specs.title"),
        subtitle: t("addVehicle.steps.specs.subtitle"),
        content: <SpecsStep />,
        canProceed: canProceedSpecs,
      },
      {
        id: "vehicle-details",
        title: t("addVehicle.steps.details.title"),
        subtitle: t("addVehicle.steps.details.subtitle"),
        content: <DetailsStep />,
        canProceed: canProceedDetails,
      },
      {
        id: "odometer-purchase",
        title: t("addVehicle.steps.odometer.title"),
        subtitle: t("addVehicle.steps.odometer.subtitle"),
        content: <OdometerStep />,
        canProceed: canProceedOdometer,
      },
      {
        id: "photos",
        title: t("addVehicle.steps.photo.title"),
        subtitle: t("addVehicle.steps.photo.subtitle"),
        content: <PhotoStep />,
        canProceed: canProceedPhotos,
      },
    ],
    [t, canProceedSpecs, canProceedDetails, canProceedOdometer, canProceedPhotos],
  );

  return (
    <AppWizard
      steps={steps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      completeLabel={t("editVehicle.saveChanges")}
      isSubmitting={isSubmitting}
    />
  );
}

type EditVehicleWizardProps = {
  vehicle: DetailedVehicleModel;
};

export function EditVehicleWizard({ vehicle }: EditVehicleWizardProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const validationSchema = useMemo(() => createEditVehicleValidator(t), [t]);

  // Convert vehicle data to form state
  const initialFormState: EditVehicleFormState = useMemo(
    () => ({
      fuelTypeId: vehicle.fuelType.id,
      transmissionTypeId: vehicle.transmissionType.id,
      bodyTypeId: vehicle.bodyType.id,

      plate: vehicle.plate || "",
      color: vehicle.color || "",
      vin: vehicle.vin || "",
      currentKm: vehicle.currentKm || 0,
      purchasePrice: vehicle.purchasePrice || 0,
      purchaseKm: vehicle.purchaseKm || 0,
      purchaseDate: vehicle.purchaseDate
        ? new Date(vehicle.purchaseDate)
        : null,
      coverPhotoUri: vehicle.coverPhoto?.url || null,
      additionalPhotos: {
        interior: null,
        rear: null,
        side: null,
        front: null,
        engine: null,
        wheels: null,
        other: null,
      },
    }),
    [vehicle],
  );

  // Store original data for comparison
  const originalData = useRef({
    fuelTypeId: vehicle.fuelType.id,
    transmissionTypeId: vehicle.transmissionType.id,
    bodyTypeId: vehicle.bodyType.id,
    plate: vehicle.plate,
    vin: vehicle.vin,
    color: vehicle.color,
    purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate) : null,
    purchasePrice: vehicle.purchasePrice,
    purchaseKm: vehicle.purchaseKm,
    coverPhotoUri: vehicle.coverPhoto?.url || null,
    additionalPhotos: {
      interior: null as string | null,
      rear: null as string | null,
      side: null as string | null,
      front: null as string | null,
      engine: null as string | null,
      wheels: null as string | null,
      other: null as string | null,
    },
  }).current;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Formik
        initialValues={initialFormState}
        onSubmit={() => {}}
        validationSchema={validationSchema}
        validateOnChange={true}
      >
        <EditVehicleForm vehicle={vehicle} originalData={originalData} />
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
