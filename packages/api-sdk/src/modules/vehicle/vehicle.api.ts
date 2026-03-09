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
  UpsertBrandModelPayload,
  UpsertBrandModelResponse,
} from "@garagely/shared/payloads/vehicle";
import type {
  HttpClient,
  SdkCallbacks,
  SdkPaginatedCallbacks,
  SdkError,
  CancelableRequest,
} from "../../types";

export interface VehicleApi {
  // Lookup methods
  getBrands(
    query?: SearchPaginationQuery,
    callbacks?: SdkPaginatedCallbacks<VehicleBrandModel>,
    key?: string,
  ): CancelableRequest<void>;
  getModelsByBrand(
    brandId: string,
    query?: SearchPaginationQuery,
    callbacks?: SdkPaginatedCallbacks<VehicleModelModel>,
    key?: string,
  ): CancelableRequest<void>;
  getTransmissionTypes(
    callbacks?: SdkCallbacks<VehicleTransmissionTypeModel[]>,
    key?: string,
  ): CancelableRequest<void>;
  getBodyTypes(
    callbacks?: SdkCallbacks<VehicleBodyTypeModel[]>,
    key?: string,
  ): CancelableRequest<void>;
  getFuelTypes(
    callbacks?: SdkCallbacks<VehicleFuelTypeModel[]>,
    key?: string,
  ): CancelableRequest<void>;

  // Upsert brand and model together
  upsertBrandAndModel(
    payload: UpsertBrandModelPayload,
    callbacks?: SdkCallbacks<UpsertBrandModelResponse>,
    key?: string,
  ): CancelableRequest<void>;

  // Vehicle CRUD
  getVehicles(
    callbacks?: SdkCallbacks<VehicleModel[]>,
    key?: string,
  ): CancelableRequest<void>;
  getVehicleById(
    vehicleId: string,
    callbacks?: SdkCallbacks<VehicleModel>,
    key?: string,
  ): CancelableRequest<void>;
  createVehicle(
    payload: CreateVehiclePayload,
    callbacks?: SdkCallbacks<VehicleModel>,
    key?: string,
  ): CancelableRequest<void>;
  updateVehicle(
    vehicleId: string,
    payload: UpdateVehiclePayload,
    callbacks?: SdkCallbacks<VehicleModel>,
    key?: string,
  ): CancelableRequest<void>;
  deleteVehicle(
    vehicleId: string,
    callbacks?: SdkCallbacks<void>,
    key?: string,
  ): CancelableRequest<void>;

  // Vehicle images
  uploadImage(
    vehicleId: string,
    imageType: VehicleImageType,
    file: File | Blob,
    callbacks?: SdkCallbacks<DocumentModel>,
    key?: string,
  ): CancelableRequest<void>;
  getImage(
    vehicleId: string,
    imageType: VehicleImageType,
    callbacks?: SdkCallbacks<DocumentModel | null>,
    key?: string,
  ): CancelableRequest<void>;
  removeImage(
    vehicleId: string,
    imageType: VehicleImageType,
    callbacks?: SdkCallbacks<void>,
    key?: string,
  ): CancelableRequest<void>;
  getAllImages(
    vehicleId: string,
    callbacks?: SdkCallbacks<Record<VehicleImageType, DocumentModel | null>>,
    key?: string,
  ): CancelableRequest<void>;
}

export function createVehicleApi(client: HttpClient): VehicleApi {
  return {
    // Lookup methods
    getBrands(
      query?: SearchPaginationQuery,
      callbacks?: SdkPaginatedCallbacks<VehicleBrandModel>,
      key?: string,
    ): CancelableRequest<void> {
      const params = new URLSearchParams();
      if (query?.search) params.set("search", query.search);
      if (query?.page) params.set("page", String(query.page));
      if (query?.pageSize) params.set("pageSize", String(query.pageSize));
      const queryString = params.toString();
      const url = queryString
        ? `/vehicles/brands?${queryString}`
        : "/vehicles/brands";

      const { request, cancel } = client.get<PaginatedData<VehicleBrandModel>>(
        url,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getModelsByBrand(
      brandId: string,
      query?: SearchPaginationQuery,
      callbacks?: SdkPaginatedCallbacks<VehicleModelModel>,
      key?: string,
    ): CancelableRequest<void> {
      const params = new URLSearchParams();
      if (query?.search) params.set("search", query.search);
      if (query?.page) params.set("page", String(query.page));
      if (query?.pageSize) params.set("pageSize", String(query.pageSize));
      const queryString = params.toString();
      const url = queryString
        ? `/vehicles/brands/${brandId}/models?${queryString}`
        : `/vehicles/brands/${brandId}/models`;

      const { request, cancel } = client.get<PaginatedData<VehicleModelModel>>(
        url,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getTransmissionTypes(
      callbacks?: SdkCallbacks<VehicleTransmissionTypeModel[]>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<VehicleTransmissionTypeModel[]>(
        "/vehicles/transmission-types",
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getBodyTypes(
      callbacks?: SdkCallbacks<VehicleBodyTypeModel[]>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<VehicleBodyTypeModel[]>(
        "/vehicles/body-types",
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getFuelTypes(
      callbacks?: SdkCallbacks<VehicleFuelTypeModel[]>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<VehicleFuelTypeModel[]>(
        "/vehicles/fuel-types",
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    // Upsert brand and model together
    upsertBrandAndModel(
      payload: UpsertBrandModelPayload,
      callbacks?: SdkCallbacks<UpsertBrandModelResponse>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.post<UpsertBrandModelResponse>(
        "/vehicles/upsert-brand-model",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    // Vehicle CRUD
    getVehicles(
      callbacks?: SdkCallbacks<VehicleModel[]>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<VehicleModel[]>("/vehicles", key);

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getVehicleById(
      vehicleId: string,
      callbacks?: SdkCallbacks<VehicleModel>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<VehicleModel>(
        `/vehicles/${vehicleId}`,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    createVehicle(
      payload: CreateVehiclePayload,
      callbacks?: SdkCallbacks<VehicleModel>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.post<VehicleModel>(
        "/vehicles",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    updateVehicle(
      vehicleId: string,
      payload: UpdateVehiclePayload,
      callbacks?: SdkCallbacks<VehicleModel>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.patch<VehicleModel>(
        `/vehicles/${vehicleId}`,
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    deleteVehicle(
      vehicleId: string,
      callbacks?: SdkCallbacks<void>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.delete<void>(
        `/vehicles/${vehicleId}`,
        key,
      );

      return {
        request: request
          .then(() => {
            callbacks?.onSuccess?.(undefined);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    // Vehicle images
    uploadImage(
      vehicleId: string,
      imageType: VehicleImageType,
      file: File | Blob,
      callbacks?: SdkCallbacks<DocumentModel>,
      key?: string,
    ): CancelableRequest<void> {
      const formData = new FormData();
      formData.append("file", file);

      const { request, cancel } = client.postFormData<DocumentModel>(
        `/vehicles/${vehicleId}/images/${imageType}`,
        formData,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getImage(
      vehicleId: string,
      imageType: VehicleImageType,
      callbacks?: SdkCallbacks<DocumentModel | null>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<DocumentModel | null>(
        `/vehicles/${vehicleId}/images/${imageType}`,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    removeImage(
      vehicleId: string,
      imageType: VehicleImageType,
      callbacks?: SdkCallbacks<void>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.delete<void>(
        `/vehicles/${vehicleId}/images/${imageType}`,
        key,
      );

      return {
        request: request
          .then(() => {
            callbacks?.onSuccess?.(undefined);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getAllImages(
      vehicleId: string,
      callbacks?: SdkCallbacks<Record<VehicleImageType, DocumentModel | null>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<
        Record<VehicleImageType, DocumentModel | null>
      >(`/vehicles/${vehicleId}/images`, key);

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },
  };
}
