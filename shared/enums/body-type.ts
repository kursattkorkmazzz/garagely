export const BodyTypes = {
  SEDAN: "sedan",
  HATCHBACK: "hatchback",
  SUV: "suv",
  CROSSOVER: "crossover",
  COUPE: "coupe",
  CONVERTIBLE: "convertible",
  WAGON: "wagon",
  VAN: "van",
  PICKUP: "pickup",
  MINIVAN: "minivan",
} as const;

export type BodyType = (typeof BodyTypes)[keyof typeof BodyTypes];
