import type {
  VehicleModel,
  VehicleBrandModel,
  VehicleModelModel,
  VehicleFuelTypeModel,
  VehicleTransmissionTypeModel,
  VehicleBodyTypeModel,
} from "@garagely/shared/models/vehicle";
import { VehicleImageType } from "@garagely/shared/models/vehicle";
import type { DocumentModel } from "@garagely/shared/models/document";
import type {
  CreateVehiclePayload,
  CreateVehicleModelPayload,
  UpsertBrandModelPayload,
  UpsertBrandModelResponse,
} from "@garagely/shared/payloads/vehicle";
import type { SdkError } from "@garagely/api-sdk";
import { sdk } from "../sdk";

export interface VehicleCallbacks {
  onSuccess?: () => void;
  onError?: (error: SdkError) => void;
}

export interface VehicleSlice {
  // State - Vehicles
  vehicles: VehicleModel[];
  isLoadingVehicles: boolean;
  vehiclesError: string | null;

  // State - Lookups
  brands: VehicleBrandModel[];
  models: VehicleModelModel[];
  fuelTypes: VehicleFuelTypeModel[];
  transmissionTypes: VehicleTransmissionTypeModel[];
  bodyTypes: VehicleBodyTypeModel[];
  isLoadingLookups: boolean;
  lookupsError: string | null;

  // State - Create
  isCreating: boolean;
  createError: string | null;

  // State - Cover Upload
  isUploadingCover: boolean;
  uploadCoverError: string | null;

  // Actions - Vehicles
  fetchVehicles: (callbacks?: VehicleCallbacks) => Promise<void>;
  createVehicle: (
    payload: CreateVehiclePayload,
    callbacks?: VehicleCallbacks & {
      onSuccess?: (vehicle: VehicleModel) => void;
    },
  ) => Promise<VehicleModel | null>;
  deleteVehicle: (
    vehicleId: string,
    callbacks?: VehicleCallbacks,
  ) => Promise<void>;

  // Actions - Lookups
  fetchBrands: (callbacks?: VehicleCallbacks) => Promise<void>;
  fetchModelsByBrand: (
    brandId: string,
    callbacks?: VehicleCallbacks,
  ) => Promise<void>;
  fetchFuelTypes: (callbacks?: VehicleCallbacks) => Promise<void>;
  fetchTransmissionTypes: (callbacks?: VehicleCallbacks) => Promise<void>;
  fetchBodyTypes: (callbacks?: VehicleCallbacks) => Promise<void>;
  fetchAllLookups: (callbacks?: VehicleCallbacks) => Promise<void>;
  upsertBrandAndModel: (
    payload: UpsertBrandModelPayload,
    callbacks?: VehicleCallbacks & {
      onSuccess?: (result: UpsertBrandModelResponse) => void;
    },
  ) => Promise<UpsertBrandModelResponse | null>;

  // Actions - Images
  uploadImage: (
    vehicleId: string,
    imageType: VehicleImageType,
    uri: string,
    callbacks?: VehicleCallbacks,
  ) => Promise<DocumentModel | null>;
  removeImage: (
    vehicleId: string,
    imageType: VehicleImageType,
    callbacks?: VehicleCallbacks,
  ) => Promise<void>;
  uploadCover: (
    vehicleId: string,
    uri: string,
    callbacks?: VehicleCallbacks,
  ) => Promise<DocumentModel | null>;

  // Actions - Clear
  clearModels: () => void;
  clearErrors: () => void;
}

type SetVehicleState = (partial: Partial<VehicleSlice>) => void;
type GetVehicleState = () => VehicleSlice;

// React Native file format for FormData uploads
function createReactNativeFile(uri: string, imageType: VehicleImageType) {
  const uriParts = uri.split(".");
  const extension = uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";

  return {
    uri,
    type: mimeType,
    name: `${imageType}.${extension}`,
  } as unknown as Blob;
}

export const createVehicleSlice = (
  set: SetVehicleState,
  get: GetVehicleState,
): VehicleSlice => ({
  // Initial state - Vehicles
  vehicles: [],
  isLoadingVehicles: false,
  vehiclesError: null,

  // Initial state - Lookups
  brands: [],
  models: [],
  fuelTypes: [],
  transmissionTypes: [],
  bodyTypes: [],
  isLoadingLookups: false,
  lookupsError: null,

  // Initial state - Create
  isCreating: false,
  createError: null,

  // Initial state - Cover Upload
  isUploadingCover: false,
  uploadCoverError: null,

  // Actions - Vehicles
  fetchVehicles: async (callbacks?: VehicleCallbacks) => {
    set({ isLoadingVehicles: true, vehiclesError: null });

    await sdk.vehicle.getVehicles({
      onSuccess: (data) => {
        set({ vehicles: data, isLoadingVehicles: false });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ isLoadingVehicles: false, vehiclesError: err.message });
        callbacks?.onError?.(err);
      },
    });
  },

  createVehicle: async (
    payload: CreateVehiclePayload,
    callbacks?: VehicleCallbacks & {
      onSuccess?: (vehicle: VehicleModel) => void;
    },
  ): Promise<VehicleModel | null> => {
    console.log("[VehicleSlice] createVehicle called with payload:", JSON.stringify(payload));
    set({ isCreating: true, createError: null });

    let createdVehicle: VehicleModel | null = null;

    await sdk.vehicle.createVehicle(payload, {
      onSuccess: (data) => {
        console.log("[VehicleSlice] createVehicle SUCCESS:", JSON.stringify(data));
        createdVehicle = data;
        const currentVehicles = get().vehicles;
        set({
          vehicles: [...currentVehicles, data],
          isCreating: false,
        });
        callbacks?.onSuccess?.(data);
      },
      onError: (err: SdkError) => {
        console.error("[VehicleSlice] createVehicle ERROR:", err.message, err);
        set({ isCreating: false, createError: err.message });
        callbacks?.onError?.(err);
      },
    });

    console.log("[VehicleSlice] createVehicle returning:", createdVehicle ? "vehicle object" : "null");
    return createdVehicle;
  },

  deleteVehicle: async (vehicleId: string, callbacks?: VehicleCallbacks) => {
    await sdk.vehicle.deleteVehicle(vehicleId, {
      onSuccess: () => {
        const currentVehicles = get().vehicles;
        set({
          vehicles: currentVehicles.filter((v) => v.id !== vehicleId),
        });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        callbacks?.onError?.(err);
      },
    });
  },

  // Actions - Lookups
  fetchBrands: async (callbacks?: VehicleCallbacks) => {
    set({ isLoadingLookups: true, lookupsError: null });

    await sdk.vehicle.getBrands({
      onSuccess: (data) => {
        set({ brands: data, isLoadingLookups: false });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ isLoadingLookups: false, lookupsError: err.message });
        callbacks?.onError?.(err);
      },
    });
  },

  fetchModelsByBrand: async (brandId: string, callbacks?: VehicleCallbacks) => {
    set({ isLoadingLookups: true, lookupsError: null, models: [] });

    await sdk.vehicle.getModelsByBrand(brandId, {
      onSuccess: (data) => {
        set({ models: data, isLoadingLookups: false });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ isLoadingLookups: false, lookupsError: err.message });
        callbacks?.onError?.(err);
      },
    });
  },

  fetchFuelTypes: async (callbacks?: VehicleCallbacks) => {
    await sdk.vehicle.getFuelTypes({
      onSuccess: (data) => {
        set({ fuelTypes: data });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ lookupsError: err.message });
        callbacks?.onError?.(err);
      },
    });
  },

  fetchTransmissionTypes: async (callbacks?: VehicleCallbacks) => {
    await sdk.vehicle.getTransmissionTypes({
      onSuccess: (data) => {
        set({ transmissionTypes: data });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ lookupsError: err.message });
        callbacks?.onError?.(err);
      },
    });
  },

  fetchBodyTypes: async (callbacks?: VehicleCallbacks) => {
    await sdk.vehicle.getBodyTypes({
      onSuccess: (data) => {
        set({ bodyTypes: data });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ lookupsError: err.message });
        callbacks?.onError?.(err);
      },
    });
  },

  fetchAllLookups: async (callbacks?: VehicleCallbacks) => {
    set({ isLoadingLookups: true, lookupsError: null });

    try {
      await Promise.all([
        sdk.vehicle.getBrands({
          onSuccess: (data) => set({ brands: data }),
          onError: () => {},
        }),
        sdk.vehicle.getFuelTypes({
          onSuccess: (data) => set({ fuelTypes: data }),
          onError: () => {},
        }),
        sdk.vehicle.getTransmissionTypes({
          onSuccess: (data) => set({ transmissionTypes: data }),
          onError: () => {},
        }),
        sdk.vehicle.getBodyTypes({
          onSuccess: (data) => set({ bodyTypes: data }),
          onError: () => {},
        }),
      ]);

      set({ isLoadingLookups: false });
      callbacks?.onSuccess?.();
    } catch {
      set({ isLoadingLookups: false, lookupsError: "Failed to load lookups" });
      callbacks?.onError?.({ message: "Failed to load lookups" } as SdkError);
    }
  },
  upsertBrandAndModel: async (
    payload: UpsertBrandModelPayload,
    callbacks?: VehicleCallbacks & {
      onSuccess?: (result: UpsertBrandModelResponse) => void;
    },
  ): Promise<UpsertBrandModelResponse | null> => {
    console.log("[VehicleSlice] upsertBrandAndModel called with payload:", JSON.stringify(payload));
    set({ isLoadingLookups: true, lookupsError: null });

    let result: UpsertBrandModelResponse | null = null;

    await sdk.vehicle.upsertBrandAndModel(payload, {
      onSuccess: (data) => {
        console.log("[VehicleSlice] upsertBrandAndModel SUCCESS:", JSON.stringify(data));
        result = data;
        set({ isLoadingLookups: false });
        callbacks?.onSuccess?.(data);
      },
      onError: (err: SdkError) => {
        console.error("[VehicleSlice] upsertBrandAndModel ERROR:", err.message, err);
        set({ isLoadingLookups: false, lookupsError: err.message });
        callbacks?.onError?.(err);
      },
    });

    console.log("[VehicleSlice] upsertBrandAndModel returning:", result ? "result object" : "null");
    return result;
  },

  // Actions - Images
  uploadImage: async (
    vehicleId: string,
    imageType: VehicleImageType,
    uri: string,
    callbacks?: VehicleCallbacks,
  ): Promise<DocumentModel | null> => {
    console.log("[VehicleSlice] uploadImage called:", { vehicleId, imageType, uri });
    let uploadedDocument: DocumentModel | null = null;
    const file = createReactNativeFile(uri, imageType);
    console.log("[VehicleSlice] Created file object:", file);

    await sdk.vehicle.uploadImage(vehicleId, imageType, file, {
      onSuccess: (data) => {
        console.log("[VehicleSlice] uploadImage SUCCESS:", JSON.stringify(data));
        uploadedDocument = data;
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        console.error("[VehicleSlice] uploadImage ERROR:", err.message, err);
        callbacks?.onError?.(err);
      },
    });

    console.log("[VehicleSlice] uploadImage returning:", uploadedDocument ? "document" : "null");
    return uploadedDocument;
  },

  removeImage: async (
    vehicleId: string,
    imageType: VehicleImageType,
    callbacks?: VehicleCallbacks,
  ): Promise<void> => {
    await sdk.vehicle.removeImage(vehicleId, imageType, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        callbacks?.onError?.(err);
      },
    });
  },

  uploadCover: async (
    vehicleId: string,
    uri: string,
    callbacks?: VehicleCallbacks,
  ): Promise<DocumentModel | null> => {
    set({ isUploadingCover: true, uploadCoverError: null });

    let uploadedDocument: DocumentModel | null = null;
    const file = createReactNativeFile(uri, VehicleImageType.COVER);

    await sdk.vehicle.uploadImage(vehicleId, VehicleImageType.COVER, file, {
      onSuccess: (data) => {
        uploadedDocument = data;
        const currentVehicles = get().vehicles;
        set({
          vehicles: currentVehicles.map((v) =>
            v.id === vehicleId ? { ...v, coverPhoto: data } : v,
          ),
          isUploadingCover: false,
        });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({ isUploadingCover: false, uploadCoverError: err.message });
        callbacks?.onError?.(err);
      },
    });

    return uploadedDocument;
  },

  // Actions - Clear
  clearModels: () => {
    set({ models: [] });
  },

  clearErrors: () => {
    set({
      vehiclesError: null,
      lookupsError: null,
      createError: null,
      uploadCoverError: null,
    });
  },
});
