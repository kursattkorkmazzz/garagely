import type {
  VehicleModel,
  VehicleBrandModel,
  VehicleModelModel,
  VehicleTransmissionTypeModel,
  VehicleBodyTypeModel,
  VehicleFuelTypeModel,
  DetailedVehicleModel,
} from "@garagely/shared/models/vehicle";
import type { DocumentModel } from "@garagely/shared/models/document";
import { EntityType } from "@garagely/shared/models/entity-type";
import {
  VehicleImageType,
  vehicleImageTypeToEntityType,
} from "@garagely/shared/models/vehicle";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  UpsertBrandModelPayload,
  UpsertBrandModelResponse,
} from "@garagely/shared/payloads/vehicle";
import { NotFoundError, ForbiddenError } from "@garagely/shared/error.types";
import type { PaginationMeta } from "@garagely/shared/response.types";
import type { SearchPaginationQuery } from "@garagely/shared/query.types";
import { buildPaginationMeta } from "../../../common/utils/pagination.util";
import type { IVehicleRepository } from "../repositories/vehicle.repository.interface";
import type { IVehicleLookupRepository } from "../repositories/vehicle-lookup.repository.interface";
import type {
  StorageService,
  UploadedFile,
} from "../../storage/services/storage.service";
import {
  IVehicleBrandRepository,
  IVehicleModelRepository,
} from "../repositories";
import { FirestoreTransactionManager } from "../../../providers/firebase/firestore-transaction-manager";

export class VehicleService {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
    private readonly vehicleBrandRepository: IVehicleBrandRepository,
    private readonly vehicleModelRepository: IVehicleModelRepository,
    private readonly vehicleLookupRepository: IVehicleLookupRepository,
    private readonly transactionManager: FirestoreTransactionManager,
    private readonly storageService?: StorageService,
  ) {}

  // Lookup methods
  async getBrands(
    query: Required<SearchPaginationQuery>,
  ): Promise<{ data: VehicleBrandModel[]; meta: PaginationMeta }> {
    const { search, page, limit } = query;

    const result = search && search.trim()
      ? await this.vehicleBrandRepository.searchByNamePaginated(
          search.trim(),
          page,
          limit,
        )
      : await this.vehicleBrandRepository.findSystemBrandsPaginated(
          page,
          limit,
        );

    return {
      data: result.items,
      meta: buildPaginationMeta(page, limit, result.total),
    };
  }

  async getModelsByBrand(
    brandId: string,
    query: Required<SearchPaginationQuery>,
  ): Promise<{ data: VehicleModelModel[]; meta: PaginationMeta }> {
    const brand = await this.vehicleBrandRepository.findById(brandId);

    if (!brand) {
      throw new NotFoundError("Brand not found");
    }

    const { search, page, limit } = query;

    const result = search && search.trim()
      ? await this.vehicleModelRepository.searchByNameInBrandPaginated(
          brandId,
          search.trim(),
          page,
          limit,
        )
      : await this.vehicleModelRepository.findByBrandIdPaginated(
          brandId,
          page,
          limit,
        );

    return {
      data: result.items,
      meta: buildPaginationMeta(page, limit, result.total),
    };
  }

  async getTransmissionTypes(): Promise<VehicleTransmissionTypeModel[]> {
    return this.vehicleLookupRepository.findAllTransmissionTypes();
  }

  async getBodyTypes(): Promise<VehicleBodyTypeModel[]> {
    return this.vehicleLookupRepository.findAllBodyTypes();
  }

  async getFuelTypes(): Promise<VehicleFuelTypeModel[]> {
    return this.vehicleLookupRepository.findAllFuelTypes();
  }

  // Upsert brand and model - finds or creates both
  async upsertBrandAndModel(
    data: UpsertBrandModelPayload,
  ): Promise<UpsertBrandModelResponse> {
    return this.transactionManager.run<UpsertBrandModelResponse>(async (tx) => {
      // Find or create brand
      let brand = await this.vehicleBrandRepository.findByNameLower(
        data.brand.name.toLowerCase(),
        tx,
      );
      if (!brand) {
        brand = await this.vehicleBrandRepository.create(
          {
            name: data.brand.name.trim(),
            isSystem: false,
            isActive: true,
            logoUrl: null,
          },
          tx,
        );
      }

      // Find or create model
      let model = await this.vehicleModelRepository.findByBrandNameYear(
        brand.id,
        data.model.name.toLowerCase(),
        null,
      );

      if (!model) {
        model = await this.vehicleModelRepository.create(
          {
            brandId: brand.id,
            name: data.model.name.trim(),
            year: null,
            isSystem: false,
            isActive: true,
            coverPhotoUrl: null,
          },
          tx,
        );
      }
      return {
        brand: brand,
        model: model,
      };
    });
  }

  // Vehicle CRUD
  async createVehicle(
    userId: string,
    data: CreateVehiclePayload,
  ): Promise<VehicleModel> {
    await this.validateVehicleReferences(data);

    const vehicle = await this.vehicleRepository.create(userId, data);
    return { ...vehicle, coverPhoto: null };
  }

  async getVehiclesByUser(userId: string): Promise<VehicleModel[]> {
    const vehicles = await this.vehicleRepository.findByUserId(userId);

    const vehiclesWithCover = await Promise.all(
      vehicles.map(async (vehicle) => {
        const coverPhoto = this.storageService
          ? await this.getImage(vehicle.id, VehicleImageType.COVER)
          : null;
        return { ...vehicle, coverPhoto };
      }),
    );

    return vehiclesWithCover;
  }

  async getDetailedVehiclesByUser(
    userId: string,
  ): Promise<DetailedVehicleModel[]> {
    const vehicles = await this.vehicleRepository.findByUserId(userId);

    const detailedVehicles = await Promise.all(
      vehicles.map(async (vehicle) => {
        const [brand, model, fuelType, transmissionType, bodyType, coverPhoto] =
          await Promise.all([
            this.vehicleBrandRepository.findById(vehicle.vehicleBrandId),
            this.vehicleModelRepository.findById(vehicle.vehicleModelId),
            this.vehicleLookupRepository.findFuelTypeById(
              vehicle.vehicleFuelTypeId,
            ),
            this.vehicleLookupRepository.findTransmissionTypeById(
              vehicle.vehicleTransmissionTypeId,
            ),
            this.vehicleLookupRepository.findBodyTypeById(
              vehicle.vehicleBodyTypeId,
            ),
            this.storageService
              ? this.getImage(vehicle.id, VehicleImageType.COVER)
              : null,
          ]);

        return {
          id: vehicle.id,
          userId: vehicle.userId,
          color: vehicle.color,
          plate: vehicle.plate,
          vin: vehicle.vin,
          currentKm: vehicle.currentKm,
          coverPhoto,
          purchaseDate: vehicle.purchaseDate,
          purchasePrice: vehicle.purchasePrice,
          purchaseKm: vehicle.purchaseKm,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
          brand: brand!,
          model: model!,
          fuelType: fuelType!,
          transmissionType: transmissionType!,
          bodyType: bodyType!,
        };
      }),
    );

    return detailedVehicles;
  }

  async getVehicleById(
    userId: string,
    vehicleId: string,
  ): Promise<VehicleModel> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You do not have access to this vehicle");
    }

    const coverPhoto = this.storageService
      ? await this.getImage(vehicleId, VehicleImageType.COVER)
      : null;

    return { ...vehicle, coverPhoto };
  }

  async updateVehicle(
    userId: string,
    vehicleId: string,
    data: UpdateVehiclePayload,
  ): Promise<VehicleModel> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You do not have access to this vehicle");
    }

    await this.validateVehicleReferences(data);

    const updatedVehicle = await this.vehicleRepository.update(vehicleId, data);
    const coverPhoto = this.storageService
      ? await this.getImage(vehicleId, VehicleImageType.COVER)
      : null;

    return { ...updatedVehicle, coverPhoto };
  }

  async deleteVehicle(userId: string, vehicleId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You do not have access to this vehicle");
    }

    // Delete all vehicle images
    if (this.storageService) {
      const imageTypes = Object.values(VehicleImageType);
      await Promise.all(
        imageTypes.map((imageType) =>
          this.storageService!.deleteDocumentsByEntity(
            vehicleId,
            vehicleImageTypeToEntityType[imageType],
            userId,
          ),
        ),
      );
    }

    await this.vehicleRepository.delete(vehicleId);
  }

  // Vehicle image methods
  async uploadImage(
    userId: string,
    vehicleId: string,
    imageType: VehicleImageType,
    file: UploadedFile,
  ): Promise<DocumentModel> {
    if (!this.storageService) {
      throw new Error("Storage service not configured");
    }

    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You do not have access to this vehicle");
    }

    const entityType = vehicleImageTypeToEntityType[imageType];

    // Delete existing image of this type (each type allows only 1 image)
    await this.storageService.deleteDocumentsByEntity(
      vehicleId,
      entityType,
      userId,
    );

    return this.storageService.uploadAndLinkDocument(
      userId,
      file,
      { entityType },
      vehicleId,
    );
  }

  async getImage(
    vehicleId: string,
    imageType: VehicleImageType,
  ): Promise<DocumentModel | null> {
    if (!this.storageService) {
      throw new Error("Storage service not configured");
    }

    const entityType = vehicleImageTypeToEntityType[imageType];
    const documents = await this.storageService.getDocumentsByEntity(
      vehicleId,
      entityType,
    );

    return documents[0] ?? null;
  }

  async removeImage(
    userId: string,
    vehicleId: string,
    imageType: VehicleImageType,
  ): Promise<void> {
    if (!this.storageService) {
      throw new Error("Storage service not configured");
    }

    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You do not have access to this vehicle");
    }

    const entityType = vehicleImageTypeToEntityType[imageType];
    await this.storageService.deleteDocumentsByEntity(
      vehicleId,
      entityType,
      userId,
    );
  }

  async getAllImages(
    vehicleId: string,
  ): Promise<Record<VehicleImageType, DocumentModel | null>> {
    if (!this.storageService) {
      throw new Error("Storage service not configured");
    }

    const imageTypes = Object.values(VehicleImageType);
    const results = await Promise.all(
      imageTypes.map(async (imageType) => {
        const image = await this.getImage(vehicleId, imageType);
        return [imageType, image] as const;
      }),
    );

    return Object.fromEntries(results) as Record<
      VehicleImageType,
      DocumentModel | null
    >;
  }

  // Validation helpers
  private async validateVehicleReferences(
    data: CreateVehiclePayload | UpdateVehiclePayload,
  ): Promise<void> {
    if (data.vehicleBrandId !== undefined) {
      const brand = await this.vehicleBrandRepository.findById(
        data.vehicleBrandId,
      );
      if (!brand) {
        throw new NotFoundError("Brand not found");
      }
    }

    if (data.vehicleModelId !== undefined) {
      const model = await this.vehicleModelRepository.findById(
        data.vehicleModelId,
      );
      if (!model) {
        throw new NotFoundError("Model not found");
      }
    }

    if (data.vehicleTransmissionTypeId !== undefined) {
      const transmissionType =
        await this.vehicleLookupRepository.findTransmissionTypeById(
          data.vehicleTransmissionTypeId,
        );
      if (!transmissionType) {
        throw new NotFoundError("Transmission type not found");
      }
    }

    if (data.vehicleBodyTypeId !== undefined) {
      const bodyType = await this.vehicleLookupRepository.findBodyTypeById(
        data.vehicleBodyTypeId,
      );
      if (!bodyType) {
        throw new NotFoundError("Body type not found");
      }
    }

    if (data.vehicleFuelTypeId !== undefined) {
      const fuelType = await this.vehicleLookupRepository.findFuelTypeById(
        data.vehicleFuelTypeId,
      );
      if (!fuelType) {
        throw new NotFoundError("Fuel type not found");
      }
    }
  }
}
