export const FuelTypes = {
  GASOLINE: "gasoline",
  DIESEL: "diesel",
  ELECTRIC: "electric",
  HYBRID: "hybrid",
  LPG: "lpg",
  CNG: "cng",
} as const;

export type FuelType = (typeof FuelTypes)[keyof typeof FuelTypes];
