import {
  vehicleBrandModelValidator,
  type VehicleBrandModel,
} from "@garagely/shared/models/vehicle";
import type { IVehicleBrandRepository } from "./vehicle-brand.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";

const VEHICLE_BRANDS_COLLECTION = "vehicle_brands";

export class VehicleBrandRepository implements IVehicleBrandRepository<FirebaseFirestore.Transaction> {
  async findAll(
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel[]> {
    const snapshotRef = await db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isActive", "==", true)
      .orderBy("name");

    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();

    return snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async findById(
    id: string,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel | null> {
    const docRef = db.collection(VEHICLE_BRANDS_COLLECTION).doc(id);
    const doc = tx ? await tx?.get(docRef) : await docRef.get();
    if (!doc.exists) {
      return null;
    }
    return vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findByNameLower(
    nameLower: string,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel | null> {
    const snapshotRef = db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("nameLower", "==", nameLower)
      .where("isActive", "==", true)
      .limit(1);

    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findSystemBrands(
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel[]> {
    const snapshotRef = await db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isSystem", "==", true)
      .where("isActive", "==", true)
      .orderBy("name");

    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();
    return snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async create(
    data: {
      name: string;
      isSystem: boolean;
      isActive: boolean;
    },
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel> {
    const docRef = await db.collection(VEHICLE_BRANDS_COLLECTION).add({
      name: data.name,
      nameLower: data.name.toLowerCase(),
      logoUrl: null,
      isSystem: data.isSystem,
      isActive: data.isActive,
    });

    const doc = tx ? await tx?.get(docRef) : await docRef.get();
    return vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() });
  }
}
