import {
  vehicleBrandModelValidator,
  type VehicleBrandModel,
} from "@garagely/shared/models/vehicle";
import type { IVehicleBrandRepository } from "./vehicle-brand.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";

const VEHICLE_BRANDS_COLLECTION = "vehicle_brands";

export class VehicleBrandRepository implements IVehicleBrandRepository {
  async findAll(): Promise<VehicleBrandModel[]> {
    const snapshot = await db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isActive", "==", true)
      .orderBy("name")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() })
    );
  }

  async findById(id: string): Promise<VehicleBrandModel | null> {
    const doc = await db.collection(VEHICLE_BRANDS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findSystemBrands(): Promise<VehicleBrandModel[]> {
    const snapshot = await db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isSystem", "==", true)
      .where("isActive", "==", true)
      .orderBy("name")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() })
    );
  }
}
