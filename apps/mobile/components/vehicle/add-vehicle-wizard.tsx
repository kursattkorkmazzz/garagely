import { useState, useCallback, useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores/root.store";
import { appToast } from "@/components/ui/app-toast";
import { AppWizard, type WizardStep } from "@/components/ui/app-wizard";
import { BrandModelStep } from "./brand-model-step";
import { SpecsStep } from "./specs-step";
import { DetailsStep } from "./details-step";
import { OdometerStep } from "./odometer-step";
import { PhotoStep } from "./photo-step";
import type { VehicleBrandModel, VehicleModelModel } from "@garagely/shared/models/vehicle";
import type { CreateVehiclePayload } from "@garagely/shared/payloads/vehicle";

type FormState = {
  // Step 1: Brand & Model
  selectedBrand: VehicleBrandModel | null;
  selectedModel: VehicleModelModel | null;
  customBrandName: string;
  customModelName: string;
  isCustomEntry: boolean;

  // Step 2: Specs
  fuelTypeId: string | null;
  transmissionTypeId: string | null;
  bodyTypeId: string | null;

  // Step 3: Details
  plate: string;
  vin: string;
  color: string | null;

  // Step 4: Odometer & Purchase
  currentKm: string;
  purchaseDate: Date | null;
  purchasePrice: string;
  purchaseKm: string;

  // Step 5: Photo
  photoUri: string | null;
};

const initialFormState: FormState = {
  selectedBrand: null,
  selectedModel: null,
  customBrandName: "",
  customModelName: "",
  isCustomEntry: false,
  fuelTypeId: null,
  transmissionTypeId: null,
  bodyTypeId: null,
  plate: "",
  vin: "",
  color: null,
  currentKm: "",
  purchaseDate: null,
  purchasePrice: "",
  purchaseKm: "",
  photoUri: null,
};

export function AddVehicleWizard() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { createVehicle, upsertBrandAndModel, uploadCover, isCreating, isUploadingCover, isLoadingLookups } = useStore(
    (state) => state.vehicle,
  );

  const [formState, setFormState] = useState<FormState>(initialFormState);

  // Update form state helpers
  const updateForm = useCallback((updates: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Step 1 handlers
  const handleBrandSelect = useCallback(
    (brand: VehicleBrandModel) => {
      updateForm({
        selectedBrand: brand,
        selectedModel: null,
        customBrandName: "",
        customModelName: "",
        isCustomEntry: false,
      });
    },
    [updateForm],
  );

  const handleModelSelect = useCallback(
    (model: VehicleModelModel | null) => {
      updateForm({
        selectedModel: model,
        customBrandName: "",
        customModelName: "",
        isCustomEntry: false,
      });
    },
    [updateForm],
  );

  const handleCustomBrandNameChange = useCallback(
    (name: string) => {
      updateForm({ customBrandName: name, selectedBrand: null, selectedModel: null });
    },
    [updateForm],
  );

  const handleCustomModelNameChange = useCallback(
    (name: string) => {
      updateForm({ customModelName: name, selectedModel: null });
    },
    [updateForm],
  );

  const handleCustomEntryChange = useCallback(
    (isCustom: boolean) => {
      updateForm({
        isCustomEntry: isCustom,
        selectedBrand: isCustom ? null : formState.selectedBrand,
        selectedModel: null,
      });
    },
    [updateForm, formState.selectedBrand],
  );

  // Step 2 handlers
  const handleFuelTypeSelect = useCallback(
    (id: string) => {
      updateForm({ fuelTypeId: id });
    },
    [updateForm],
  );

  const handleTransmissionTypeSelect = useCallback(
    (id: string) => {
      updateForm({ transmissionTypeId: id });
    },
    [updateForm],
  );

  const handleBodyTypeSelect = useCallback(
    (id: string) => {
      updateForm({ bodyTypeId: id });
    },
    [updateForm],
  );

  // Step 3 handlers
  const handlePlateChange = useCallback(
    (value: string) => {
      updateForm({ plate: value });
    },
    [updateForm],
  );

  const handleVinChange = useCallback(
    (value: string) => {
      updateForm({ vin: value });
    },
    [updateForm],
  );

  const handleColorChange = useCallback(
    (value: string) => {
      updateForm({ color: value || null });
    },
    [updateForm],
  );

  // Step 4 handlers
  const handleCurrentKmChange = useCallback(
    (value: string) => {
      updateForm({ currentKm: value });
    },
    [updateForm],
  );

  const handlePurchaseDateChange = useCallback(
    (value: Date | null) => {
      updateForm({ purchaseDate: value });
    },
    [updateForm],
  );

  const handlePurchasePriceChange = useCallback(
    (value: string) => {
      updateForm({ purchasePrice: value });
    },
    [updateForm],
  );

  const handlePurchaseKmChange = useCallback(
    (value: string) => {
      updateForm({ purchaseKm: value });
    },
    [updateForm],
  );

  // Step 5 handlers
  const handlePhotoChange = useCallback(
    (uri: string | null) => {
      updateForm({ photoUri: uri });
    },
    [updateForm],
  );

  // Validation helpers
  const canProceedStep1 = useCallback(() => {
    if (formState.isCustomEntry) {
      // Custom entry mode: both brand and model names must be provided
      const hasCustomBrand = formState.customBrandName.trim().length > 0;
      const hasCustomModel = formState.customModelName.trim().length > 0;
      return hasCustomBrand && hasCustomModel;
    }
    // Normal mode: brand and model must be selected from list
    const hasBrand = !!formState.selectedBrand;
    const hasModel = !!formState.selectedModel;
    return hasBrand && hasModel;
  }, [formState.isCustomEntry, formState.selectedBrand, formState.selectedModel, formState.customBrandName, formState.customModelName]);

  const canProceedStep2 = useCallback(() => {
    return (
      !!formState.fuelTypeId &&
      !!formState.transmissionTypeId &&
      !!formState.bodyTypeId
    );
  }, [formState.fuelTypeId, formState.transmissionTypeId, formState.bodyTypeId]);

  // Complete handler
  const handleComplete = useCallback(async () => {
    if (!formState.fuelTypeId || !formState.transmissionTypeId || !formState.bodyTypeId) {
      appToast.error(t("addVehicle.errors.selectSpecs"));
      return;
    }

    let brandId: string;
    let modelId: string;

    if (formState.isCustomEntry) {
      // Custom entry mode: use upsert endpoint
      const hasCustomBrand = formState.customBrandName.trim().length > 0;
      const hasCustomModel = formState.customModelName.trim().length > 0;

      if (!hasCustomBrand || !hasCustomModel) {
        appToast.error(t("addVehicle.errors.selectBrandModel"));
        return;
      }

      const upsertResult = await upsertBrandAndModel(
        {
          brand: { name: formState.customBrandName.trim() },
          model: { name: formState.customModelName.trim() },
        },
        {
          onError: (err) => {
            appToast.error(err.message || t("addVehicle.errors.createFailed"));
          },
        },
      );

      if (!upsertResult) {
        return;
      }

      brandId = upsertResult.brand.id;
      modelId = upsertResult.model.id;
    } else {
      // Normal mode: use selected brand and model
      if (!formState.selectedBrand || !formState.selectedModel) {
        appToast.error(t("addVehicle.errors.selectBrandModel"));
        return;
      }

      brandId = formState.selectedBrand.id;
      modelId = formState.selectedModel.id;
    }

    const payload: CreateVehiclePayload = {
      vehicleBrandId: brandId,
      vehicleModelId: modelId,
      vehicleFuelTypeId: formState.fuelTypeId,
      vehicleTransmissionTypeId: formState.transmissionTypeId,
      vehicleBodyTypeId: formState.bodyTypeId,
      plate: formState.plate || null,
      vin: formState.vin || null,
      color: formState.color,
      currentKm: formState.currentKm ? parseInt(formState.currentKm, 10) : null,
      purchaseDate: formState.purchaseDate,
      purchasePrice: formState.purchasePrice ? parseFloat(formState.purchasePrice) : null,
      purchaseKm: formState.purchaseKm ? parseInt(formState.purchaseKm, 10) : null,
    };

    const vehicle = await createVehicle(payload, {
      onSuccess: () => {},
      onError: (err) => {
        appToast.error(err.message || t("addVehicle.errors.createFailed"));
      },
    });

    if (vehicle && formState.photoUri) {
      await uploadCover(vehicle.id, formState.photoUri, {
        onError: (err) => {
          appToast(err.message || t("addVehicle.errors.uploadFailed"));
        },
      });
    }

    if (vehicle) {
      appToast.success(t("addVehicle.success"));
      router.back();
    }
  }, [formState, upsertBrandAndModel, createVehicle, uploadCover, t, router]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // Define wizard steps
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "brand-model",
        title: t("addVehicle.steps.brandModel.title"),
        subtitle: t("addVehicle.steps.brandModel.subtitle"),
        content: (
          <BrandModelStep
            selectedBrandId={formState.selectedBrand?.id || null}
            selectedModelId={formState.selectedModel?.id || null}
            customBrandName={formState.customBrandName}
            customModelName={formState.customModelName}
            isCustomEntry={formState.isCustomEntry}
            onBrandSelect={handleBrandSelect}
            onModelSelect={handleModelSelect}
            onCustomBrandNameChange={handleCustomBrandNameChange}
            onCustomModelNameChange={handleCustomModelNameChange}
            onCustomEntryChange={handleCustomEntryChange}
          />
        ),
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
      <AppWizard
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        completeLabel={t("addVehicle.createVehicle")}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
