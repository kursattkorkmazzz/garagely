import {
  vehicleTransmissionTypeModelValidator,
  vehicleBodyTypeModelValidator,
  vehicleFuelTypeModelValidator,
  type VehicleTransmissionTypeModel,
  type VehicleBodyTypeModel,
  type VehicleFuelTypeModel,
} from "@garagely/shared/models/vehicle";
import type { IVehicleLookupRepository } from "./vehicle-lookup.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";

const TRANSMISSION_TYPES_COLLECTION = "vehicle_transmission_types";
const BODY_TYPES_COLLECTION = "vehicle_body_types";
const FUEL_TYPES_COLLECTION = "vehicle_fuel_types";

export class VehicleLookupRepository implements IVehicleLookupRepository {
  async findAllTransmissionTypes(): Promise<VehicleTransmissionTypeModel[]> {
    const snapshot = await db
      .collection(TRANSMISSION_TYPES_COLLECTION)
      .where("isActive", "==", true)
      .orderBy("type")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleTransmissionTypeModelValidator.cast({ id: doc.id, ...doc.data() })
    );
  }

  async findTransmissionTypeById(id: string): Promise<VehicleTransmissionTypeModel | null> {
    const doc = await db.collection(TRANSMISSION_TYPES_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return vehicleTransmissionTypeModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findAllBodyTypes(): Promise<VehicleBodyTypeModel[]> {
    const snapshot = await db
      .collection(BODY_TYPES_COLLECTION)
      .where("isActive", "==", true)
      .orderBy("type")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleBodyTypeModelValidator.cast({ id: doc.id, ...doc.data() })
    );
  }

  async findBodyTypeById(id: string): Promise<VehicleBodyTypeModel | null> {
    const doc = await db.collection(BODY_TYPES_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return vehicleBodyTypeModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async findAllFuelTypes(): Promise<VehicleFuelTypeModel[]> {
    const snapshot = await db
      .collection(FUEL_TYPES_COLLECTION)
      .where("isActive", "==", true)
      .orderBy("type")
      .get();

    return snapshot.docs.map((doc) =>
      vehicleFuelTypeModelValidator.cast({ id: doc.id, ...doc.data() })
    );
  }

  async findFuelTypeById(id: string): Promise<VehicleFuelTypeModel | null> {
    const doc = await db.collection(FUEL_TYPES_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return vehicleFuelTypeModelValidator.cast({ id: doc.id, ...doc.data() });
  }
}
