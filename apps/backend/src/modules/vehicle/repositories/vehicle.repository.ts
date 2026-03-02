import {
  vehicleModelValidator,
  type VehicleModel,
} from "@garagely/shared/models/vehicle";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from "@garagely/shared/payloads/vehicle";
import type { IVehicleRepository } from "./vehicle.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";

const VEHICLES_COLLECTION = "vehicles";

export class VehicleRepository implements IVehicleRepository {
  async findById(id: string): Promise<VehicleModel | null> {
    const doc = await db.collection(VEHICLES_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return vehicleModelValidator.cast({ id: doc.id, ...doc.data(), coverPhoto: null });
  }

  async findByUserId(userId: string): Promise<VehicleModel[]> {
    const snapshot = await db
      .collection(VEHICLES_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleModelValidator.cast({ id: doc.id, ...doc.data(), coverPhoto: null })
    );
  }

  async create(userId: string, data: CreateVehiclePayload): Promise<VehicleModel> {
    const now = new Date();
    const vehicleData = {
      userId,
      vehicleFuelTypeId: data.vehicleFuelTypeId,
      vehicleTransmissionTypeId: data.vehicleTransmissionTypeId,
      vehicleBodyTypeId: data.vehicleBodyTypeId,
      vehicleBrandId: data.vehicleBrandId,
      vehicleModelId: data.vehicleModelId,
      color: data.color ?? null,
      plate: data.plate ?? null,
      vin: data.vin ?? null,
      currentKm: data.currentKm ?? null,
      purchaseDate: data.purchaseDate ?? null,
      purchasePrice: data.purchasePrice ?? null,
      purchaseKm: data.purchaseKm ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(VEHICLES_COLLECTION).add(vehicleData);

    return vehicleModelValidator.cast({ id: docRef.id, ...vehicleData, coverPhoto: null });
  }

  async update(id: string, data: UpdateVehiclePayload): Promise<VehicleModel> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.vehicleFuelTypeId !== undefined) {
      updateData.vehicleFuelTypeId = data.vehicleFuelTypeId;
    }
    if (data.vehicleTransmissionTypeId !== undefined) {
      updateData.vehicleTransmissionTypeId = data.vehicleTransmissionTypeId;
    }
    if (data.vehicleBodyTypeId !== undefined) {
      updateData.vehicleBodyTypeId = data.vehicleBodyTypeId;
    }
    if (data.vehicleBrandId !== undefined) {
      updateData.vehicleBrandId = data.vehicleBrandId;
    }
    if (data.vehicleModelId !== undefined) {
      updateData.vehicleModelId = data.vehicleModelId;
    }
    if (data.color !== undefined) {
      updateData.color = data.color;
    }
    if (data.plate !== undefined) {
      updateData.plate = data.plate;
    }
    if (data.vin !== undefined) {
      updateData.vin = data.vin;
    }
    if (data.currentKm !== undefined) {
      updateData.currentKm = data.currentKm;
    }
    if (data.purchaseDate !== undefined) {
      updateData.purchaseDate = data.purchaseDate;
    }
    if (data.purchasePrice !== undefined) {
      updateData.purchasePrice = data.purchasePrice;
    }
    if (data.purchaseKm !== undefined) {
      updateData.purchaseKm = data.purchaseKm;
    }

    await db.collection(VEHICLES_COLLECTION).doc(id).update(updateData);

    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await db.collection(VEHICLES_COLLECTION).doc(id).delete();
  }
}
