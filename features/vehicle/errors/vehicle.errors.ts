export const VehicleErrors = {
  PLATE_NUMBER_EXISTS: "PLATE_NUMBER_EXISTS",
} as const;

export type VehicleError = (typeof VehicleErrors)[keyof typeof VehicleErrors];
