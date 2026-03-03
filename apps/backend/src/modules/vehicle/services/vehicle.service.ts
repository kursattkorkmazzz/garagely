import type {
  VehicleModel,
  VehicleBrandModel,
  VehicleModelModel,
  VehicleTransmissionTypeModel,
  VehicleBodyTypeModel,
  VehicleFuelTypeModel,
} from "@garagely/shared/models/vehicle";
import type { DocumentModel } from "@garagely/shared/models/document";
import { EntityType } from "@garagely/shared/models/entity-type";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  UpsertBrandModelPayload,
  UpsertBrandModelResponse,
} from "@garagely/shared/payloads/vehicle";
import { NotFoundError, ForbiddenError } from "@garagely/shared/error.types";
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
  async getBrands(): Promise<VehicleBrandModel[]> {
    return this.vehicleBrandRepository.findSystemBrands();
  }

  async getModelsByBrand(brandId: string): Promise<VehicleModelModel[]> {
    const brand = await this.vehicleBrandRepository.findById(brandId);

    if (!brand) {
      throw new NotFoundError("Brand not found");
    }

    return this.vehicleModelRepository.findByBrandId(brandId);
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
          ? await this.getCover(vehicle.id)
          : null;
        return { ...vehicle, coverPhoto };
      }),
    );

    return vehiclesWithCover;
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
      ? await this.getCover(vehicleId)
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
      ? await this.getCover(vehicleId)
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

    if (this.storageService) {
      await this.storageService.deleteDocumentsByEntity(
        vehicleId,
        EntityType.VEHICLE_COVER,
        userId,
      );
    }

    await this.vehicleRepository.delete(vehicleId);
  }

  // Cover photo methods
  async uploadCover(
    userId: string,
    vehicleId: string,
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

    await this.storageService.deleteDocumentsByEntity(
      vehicleId,
      EntityType.VEHICLE_COVER,
      userId,
    );

    return this.storageService.uploadAndLinkDocument(
      userId,
      file,
      { entityType: EntityType.VEHICLE_COVER },
      vehicleId,
    );
  }

  async getCover(vehicleId: string): Promise<DocumentModel | null> {
    if (!this.storageService) {
      throw new Error("Storage service not configured");
    }

    const documents = await this.storageService.getDocumentsByEntity(
      vehicleId,
      EntityType.VEHICLE_COVER,
    );

    return documents[0] ?? null;
  }

  async removeCover(userId: string, vehicleId: string): Promise<void> {
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

    await this.storageService.deleteDocumentsByEntity(
      vehicleId,
      EntityType.VEHICLE_COVER,
      userId,
    );
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
