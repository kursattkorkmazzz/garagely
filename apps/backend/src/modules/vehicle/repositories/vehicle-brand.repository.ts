import {
  vehicleBrandModelValidator,
  type VehicleBrandModel,
} from "@garagely/shared/models/vehicle";
import type {
  IVehicleBrandRepository,
  PaginatedResult,
} from "./vehicle-brand.repository.interface";
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

  async findSystemBrandsPaginated(
    page: number,
    limit: number,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<PaginatedResult<VehicleBrandModel>> {
    const baseQuery = db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isSystem", "==", true)
      .where("isActive", "==", true);

    // Get total count
    const countSnapshot = await baseQuery.count().get();
    const total = countSnapshot.data().count;

    // Get paginated items
    const offset = (page - 1) * limit;
    const snapshotRef = baseQuery.orderBy("name").offset(offset).limit(limit);
    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();

    const items = snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() }),
    );

    return { items, total };
  }

  async searchByName(
    search: string,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel[]> {
    const searchLower = search.toLowerCase();
    const searchEnd = searchLower + "\uf8ff";

    const snapshotRef = db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isSystem", "==", true)
      .where("isActive", "==", true)
      .where("nameLower", ">=", searchLower)
      .where("nameLower", "<=", searchEnd)
      .orderBy("nameLower");

    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();
    return snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async searchByNamePaginated(
    search: string,
    page: number,
    limit: number,
    tx?: FirebaseFirestore.Transaction,
  ): Promise<PaginatedResult<VehicleBrandModel>> {
    const searchLower = search.toLowerCase();
    const searchEnd = searchLower + "\uf8ff";

    const baseQuery = db
      .collection(VEHICLE_BRANDS_COLLECTION)
      .where("isSystem", "==", true)
      .where("isActive", "==", true)
      .where("nameLower", ">=", searchLower)
      .where("nameLower", "<=", searchEnd);

    // Get total count
    const countSnapshot = await baseQuery.count().get();
    const total = countSnapshot.data().count;

    // Get paginated items
    const offset = (page - 1) * limit;
    const snapshotRef = baseQuery
      .orderBy("nameLower")
      .offset(offset)
      .limit(limit);
    const snapshot = tx ? await tx?.get(snapshotRef) : await snapshotRef.get();

    const items = snapshot.docs.map((doc) =>
      vehicleBrandModelValidator.cast({ id: doc.id, ...doc.data() }),
    );

    return { items, total };
  }

  async create(
    data: {
      name: string;
      isSystem: boolean;
      isActive: boolean;
      logoUrl: string | null;
    },
    tx?: FirebaseFirestore.Transaction,
  ): Promise<VehicleBrandModel> {
    const docRef = db.collection(VEHICLE_BRANDS_COLLECTION).doc();
    const docData = {
      name: data.name,
      nameLower: data.name.toLowerCase(),
      logoUrl: data.logoUrl,
      isSystem: data.isSystem,
      isActive: data.isActive,
    };

    if (tx) {
      tx.set(docRef, docData);
    } else {
      await docRef.set(docData);
    }

    return vehicleBrandModelValidator.cast({ id: docRef.id, ...docData });
  }

  generateId(): string {
    return db.collection(VEHICLE_BRANDS_COLLECTION).doc().id;
  }

  createWithId(
    id: string,
    data: {
      name: string;
      isSystem: boolean;
      isActive: boolean;
      logoUrl: string | null;
    },
    tx?: FirebaseFirestore.Transaction,
  ): VehicleBrandModel {
    const docRef = db.collection(VEHICLE_BRANDS_COLLECTION).doc(id);
    const docData = {
      name: data.name,
      nameLower: data.name.toLowerCase(),
      logoUrl: data.logoUrl,
      isSystem: data.isSystem,
      isActive: data.isActive,
    };

    if (tx) {
      tx.set(docRef, docData);
    } else {
      throw new Error("createWithId requires a transaction");
    }

    return vehicleBrandModelValidator.cast({ id, ...docData });
  }
}
