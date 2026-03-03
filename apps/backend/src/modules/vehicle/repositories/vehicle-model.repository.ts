import {
  vehicleModelModelValidator,
  type VehicleModelModel,
} from "@garagely/shared/models/vehicle";
import type { CreateVehicleModelPayload } from "@garagely/shared/payloads/vehicle";
import { db } from "../../../providers/firebase/firebase.provider";
import { IVehicleModelRepository } from "./vehicle-model.repository.interface";

const VEHICLE_MODELS_COLLECTION = "vehicle_models";

export class VehicleModelRepository implements IVehicleModelRepository<FirebaseFirestore.Transaction> {
  async findById(
    id: string,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleModelModel | null> {
    const docRef = await db.collection(VEHICLE_MODELS_COLLECTION).doc(id);
    const doc = tx ? await tx?.get(docRef) : await docRef.get();
    if (!doc.exists) {
      return null;
    }
    return vehicleModelModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findByBrandId(
    brandId: string,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleModelModel[]> {
    const snapshotRef = await db
      .collection(VEHICLE_MODELS_COLLECTION)
      .where("brandId", "==", brandId)
      .where("isActive", "==", true)
      .orderBy("isSystem", "desc")
      .orderBy("name");

    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();
    return snapshot.docs.map((doc) =>
      vehicleModelModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async findByBrandNameYear(
    brandId: string,
    nameLower: string,
    year: number | null | undefined,
    tx?: FirebaseFirestore.Transaction,
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

    const snapshotRef = query.limit(1);
    const snapshot = tx ? await tx.get(snapshotRef) : await snapshotRef.get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return vehicleModelModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async create(
    data: CreateVehicleModelPayload & { isSystem: boolean; isActive: boolean },
    tx?: FirebaseFirestore.Transaction,
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

    const docRef = db.collection(VEHICLE_MODELS_COLLECTION).doc();

    tx ? tx.set(docRef, modelData) : await docRef.create(modelData);

    return vehicleModelModelValidator.cast({ id: docRef.id, ...modelData });
  }
}
