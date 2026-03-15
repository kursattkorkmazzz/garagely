import type { UpdateVehiclePayload } from "@garagely/shared/payloads/vehicle";

type VehicleFormState = {
  fuelTypeId: string | undefined;
  transmissionTypeId: string | undefined;
  bodyTypeId: string | null;
  plate: string | null;
  vin: string | null;
  color: string | null;
  purchaseDate: Date | null;
  purchasePrice: number;
  purchaseKm: number;
};

type OriginalVehicleData = {
  fuelTypeId: string;
  transmissionTypeId: string;
  bodyTypeId: string;
  plate: string | null;
  vin: string | null;
  color: string | null;
  purchaseDate: Date | null;
  purchasePrice: number | null;
  purchaseKm: number | null;
};

export function getChangedVehicleFields(
  original: OriginalVehicleData,
  current: VehicleFormState,
): Partial<UpdateVehiclePayload> {
  const changes: Partial<UpdateVehiclePayload> = {};

  if (current.fuelTypeId && original.fuelTypeId !== current.fuelTypeId) {
    changes.vehicleFuelTypeId = current.fuelTypeId;
  }

  if (
    current.transmissionTypeId &&
    original.transmissionTypeId !== current.transmissionTypeId
  ) {
    changes.vehicleTransmissionTypeId = current.transmissionTypeId;
  }

  if (current.bodyTypeId && original.bodyTypeId !== current.bodyTypeId) {
    changes.vehicleBodyTypeId = current.bodyTypeId;
  }

  if (original.plate !== current.plate) {
    changes.plate = current.plate;
  }

  if (original.vin !== current.vin) {
    changes.vin = current.vin;
  }

  if (original.color !== current.color) {
    changes.color = current.color;
  }

  const currentPurchaseDate = current.purchaseDate?.toISOString() ?? null;
  const originalPurchaseDate = original.purchaseDate
    ? new Date(original.purchaseDate).toISOString()
    : null;
  if (originalPurchaseDate !== currentPurchaseDate) {
    changes.purchaseDate = current.purchaseDate;
  }

  const currentPrice = current.purchasePrice || null;
  if (original.purchasePrice !== currentPrice) {
    changes.purchasePrice = currentPrice;
  }

  const currentPurchaseKm = current.purchaseKm || null;
  if (original.purchaseKm !== currentPurchaseKm) {
    changes.purchaseKm = currentPurchaseKm;
  }

  return changes;
}
