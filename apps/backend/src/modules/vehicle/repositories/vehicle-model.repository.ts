import {
  vehicleModelModelValidator,
  type VehicleModelModel,
} from "@garagely/shared/models/vehicle";
import type { CreateVehicleModelPayload } from "@garagely/shared/payloads/vehicle";
import type { IVehicleModelRepository } from "./vehicle-model.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";

const VEHICLE_MODELS_COLLECTION = "vehicle_models";

export class VehicleModelRepository implements IVehicleModelRepository {
  async findById(id: string): Promise<VehicleModelModel | null> {
    const doc = await db.collection(VEHICLE_MODELS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return vehicleModelModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findByBrandId(brandId: string): Promise<VehicleModelModel[]> {
    const snapshot = await db
      .collection(VEHICLE_MODELS_COLLECTION)
      .where("brandId", "==", brandId)
      .where("isActive", "==", true)
      .orderBy("isSystem", "desc")
      .orderBy("name")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleModelModelValidator.cast({ id: doc.id, ...doc.data() })
    );
  }

  async findByBrandNameYear(
    brandId: string,
    nameLower: string,
    year: number | null | undefined
  ): Promise<VehicleModelModel | null> {
    let query = db
      .collection(VEHICLE_MODELS_COLLECTION)
      .where("brandId", "==", brandId)
      .where("nameLower", "==", nameLower);

    if (year !== null && year !== undefined) {
      query = query.where("year", "==", year);
    } else {
      query = query.where("year", "==", null);
    }

    const snapshot = await query.limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return vehicleModelModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async create(
    data: CreateVehicleModelPayload & { isSystem: boolean; isActive: boolean }
  ): Promise<VehicleModelModel> {
    const modelData = {
      brandId: data.brandId,
      name: data.name,
      nameLower: data.name.toLowerCase(),
      coverPhotoUrl: null,
      year: data.year ?? null,
      isSystem: data.isSystem,
      isActive: data.isActive,
    };

    const docRef = await db.collection(VEHICLE_MODELS_COLLECTION).add(modelData);

    return vehicleModelModelValidator.cast({ id: docRef.id, ...modelData });
  }
}
