/**
 * Common fields used by vehicle wizard step components.
 * Both AddVehicleFormState and EditVehicleFormState should include these fields.
 */
export type VehicleWizardCommonFields = {
  // Specs
  fuelTypeId: string | undefined;
  transmissionTypeId: string | undefined;
  bodyTypeId: string | null;

  // Details
  plate: string | null;
  color: string | null;
  vin: string | null;

  // Odometer & Purchase
  currentKm: number;
  purchasePrice: number;
  purchaseKm: number;
  purchaseDate: Date | null;

  // Photos
  coverPhotoUri: string | null;
  additionalPhotos: {
    interior: string | null;
    rear: string | null;
    side: string | null;
    front: string | null;
    engine: string | null;
    wheels: string | null;
    other: string | null;
  };
};
