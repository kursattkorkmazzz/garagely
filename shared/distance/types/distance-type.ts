export const DistanceTypes = {
  KM: "km",
  MI: "mi",
} as const;

export type DistanceType = (typeof DistanceTypes)[keyof typeof DistanceTypes];
