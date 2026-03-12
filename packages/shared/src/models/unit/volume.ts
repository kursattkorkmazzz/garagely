import * as yup from "yup";

export enum VolumeUnit {
  L = "l",
  GAL = "gal",
}

// SI base unit is liters
export const VOLUME_TO_LITERS: Record<VolumeUnit, number> = {
  [VolumeUnit.L]: 1,
  [VolumeUnit.GAL]: 3.78541,
};

export const VOLUME_LABELS: Record<VolumeUnit, string> = {
  [VolumeUnit.L]: "Liters",
  [VolumeUnit.GAL]: "Gallons",
};

export const volumeUnitValidator = yup
  .string()
  .oneOf(Object.values(VolumeUnit) as VolumeUnit[])
  .required();
