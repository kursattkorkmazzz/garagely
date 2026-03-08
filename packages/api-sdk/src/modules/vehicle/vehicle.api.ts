import type {
  VehicleModel,
  VehicleBrandModel,
  VehicleModelModel,
  VehicleTransmissionTypeModel,
  VehicleBodyTypeModel,
  VehicleFuelTypeModel,
} from "@garagely/shared/models/vehicle";
import { VehicleImageType } from "@garagely/shared/models/vehicle";
import type { DocumentModel } from "@garagely/shared/models/document";
import type { PaginatedData } from "@garagely/shared/response.types";
import type { SearchPaginationQuery } from "@garagely/shared/query.types";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  CreateVehicleModelPayload,
  UpsertBrandModelPayload,
  UpsertBrandModelResponse,
} from "@garagely/shared/payloads/vehicle";
import type {
  HttpClient,
  SdkCallbacks,
  SdkPaginatedCallbacks,
  SdkError,
} from "../../types";

export interface VehicleApi {
  // Lookup methods
  getBrands(
    query?: SearchPaginationQuery,
    callbacks?: SdkPaginatedCallbacks<VehicleBrandModel>,
  ): Promise<void>;
  getModelsByBrand(
    brandId: string,
    query?: SearchPaginationQuery,
    callbacks?: SdkPaginatedCallbacks<VehicleModelModel>,
  ): Promise<void>;
  getTransmissionTypes(
    callbacks?: SdkCallbacks<VehicleTransmissionTypeModel[]>,
  ): Promise<void>;
  getBodyTypes(callbacks?: SdkCallbacks<VehicleBodyTypeModel[]>): Promise<void>;
  getFuelTypes(callbacks?: SdkCallbacks<VehicleFuelTypeModel[]>): Promise<void>;

  // Upsert brand and model together
  upsertBrandAndModel(
    payload: UpsertBrandModelPayload,
    callbacks?: SdkCallbacks<UpsertBrandModelResponse>,
  ): Promise<void>;

  // Vehicle CRUD
  getVehicles(callbacks?: SdkCallbacks<VehicleModel[]>): Promise<void>;
  getVehicleById(
    vehicleId: string,
    callbacks?: SdkCallbacks<VehicleModel>,
  ): Promise<void>;
  createVehicle(
    payload: CreateVehiclePayload,
    callbacks?: SdkCallbacks<VehicleModel>,
  ): Promise<void>;
  updateVehicle(
    vehicleId: string,
    payload: UpdateVehiclePayload,
    callbacks?: SdkCallbacks<VehicleModel>,
  ): Promise<void>;
  deleteVehicle(
    vehicleId: string,
    callbacks?: SdkCallbacks<void>,
  ): Promise<void>;

  // Vehicle images
  uploadImage(
    vehicleId: string,
    imageType: VehicleImageType,
    file: File | Blob,
    callbacks?: SdkCallbacks<DocumentModel>,
  ): Promise<void>;
  getImage(
    vehicleId: string,
    imageType: VehicleImageType,
    callbacks?: SdkCallbacks<DocumentModel | null>,
  ): Promise<void>;
  removeImage(
    vehicleId: string,
    imageType: VehicleImageType,
    callbacks?: SdkCallbacks<void>,
  ): Promise<void>;
  getAllImages(
    vehicleId: string,
    callbacks?: SdkCallbacks<Record<VehicleImageType, DocumentModel | null>>,
  ): Promise<void>;
}

export function createVehicleApi(client: HttpClient): VehicleApi {
  return {
    // Lookup methods
    async getBrands(
      query?: SearchPaginationQuery,
      callbacks?: SdkPaginatedCallbacks<VehicleBrandModel>,
    ): Promise<void> {
      try {
        const params = new URLSearchParams();
        if (query?.search) params.set("search", query.search);
        if (query?.page) params.set("page", String(query.page));
        if (query?.pageSize) params.set("pageSize", String(query.pageSize));
        const queryString = params.toString();
        const url = queryString
          ? `/vehicles/brands?${queryString}`
          : "/vehicles/brands";
        const data = await client.get<PaginatedData<VehicleBrandModel>>(url);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getModelsByBrand(
      brandId: string,
      query?: SearchPaginationQuery,
      callbacks?: SdkPaginatedCallbacks<VehicleModelModel>,
    ): Promise<void> {
      try {
        const params = new URLSearchParams();
        if (query?.search) params.set("search", query.search);
        if (query?.page) params.set("page", String(query.page));
        if (query?.pageSize) params.set("pageSize", String(query.pageSize));
        const queryString = params.toString();
        const url = queryString
          ? `/vehicles/brands/${brandId}/models?${queryString}`
          : `/vehicles/brands/${brandId}/models`;
        const data = await client.get<PaginatedData<VehicleModelModel>>(url);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getTransmissionTypes(
      callbacks?: SdkCallbacks<VehicleTransmissionTypeModel[]>,
    ): Promise<void> {
      try {
        const data = await client.get<VehicleTransmissionTypeModel[]>(
          "/vehicles/transmission-types",
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getBodyTypes(
      callbacks?: SdkCallbacks<VehicleBodyTypeModel[]>,
    ): Promise<void> {
      try {
        const data = await client.get<VehicleBodyTypeModel[]>(
          "/vehicles/body-types",
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getFuelTypes(
      callbacks?: SdkCallbacks<VehicleFuelTypeModel[]>,
    ): Promise<void> {
      try {
        const data = await client.get<VehicleFuelTypeModel[]>(
          "/vehicles/fuel-types",
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    // Upsert brand and model together
    async upsertBrandAndModel(
      payload: UpsertBrandModelPayload,
      callbacks?: SdkCallbacks<UpsertBrandModelResponse>,
    ): Promise<void> {
      try {
        const data = await client.post<UpsertBrandModelResponse>(
          "/vehicles/upsert-brand-model",
          payload,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    // Vehicle CRUD
    async getVehicles(callbacks?: SdkCallbacks<VehicleModel[]>): Promise<void> {
      try {
        const data = await client.get<VehicleModel[]>("/vehicles");
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getVehicleById(
      vehicleId: string,
      callbacks?: SdkCallbacks<VehicleModel>,
    ): Promise<void> {
      try {
        const data = await client.get<VehicleModel>(`/vehicles/${vehicleId}`);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async createVehicle(
      payload: CreateVehiclePayload,
      callbacks?: SdkCallbacks<VehicleModel>,
    ): Promise<void> {
      try {
        const data = await client.post<VehicleModel>("/vehicles", payload);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async updateVehicle(
      vehicleId: string,
      payload: UpdateVehiclePayload,
      callbacks?: SdkCallbacks<VehicleModel>,
    ): Promise<void> {
      try {
        const data = await client.patch<VehicleModel>(
          `/vehicles/${vehicleId}`,
          payload,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async deleteVehicle(
      vehicleId: string,
      callbacks?: SdkCallbacks<void>,
    ): Promise<void> {
      try {
        await client.delete<void>(`/vehicles/${vehicleId}`);
        callbacks?.onSuccess?.(undefined);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    // Vehicle images
    async uploadImage(
      vehicleId: string,
      imageType: VehicleImageType,
      file: File | Blob,
      callbacks?: SdkCallbacks<DocumentModel>,
    ): Promise<void> {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const data = await client.postFormData<DocumentModel>(
          `/vehicles/${vehicleId}/images/${imageType}`,
          formData,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getImage(
      vehicleId: string,
      imageType: VehicleImageType,
      callbacks?: SdkCallbacks<DocumentModel | null>,
    ): Promise<void> {
      try {
        const data = await client.get<DocumentModel | null>(
          `/vehicles/${vehicleId}/images/${imageType}`,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async removeImage(
      vehicleId: string,
      imageType: VehicleImageType,
      callbacks?: SdkCallbacks<void>,
    ): Promise<void> {
      try {
        await client.delete<void>(`/vehicles/${vehicleId}/images/${imageType}`);
        callbacks?.onSuccess?.(undefined);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getAllImages(
      vehicleId: string,
      callbacks?: SdkCallbacks<Record<VehicleImageType, DocumentModel | null>>,
    ): Promise<void> {
      try {
        const data = await client.get<
          Record<VehicleImageType, DocumentModel | null>
        >(`/vehicles/${vehicleId}/images`);
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },
  };
}
