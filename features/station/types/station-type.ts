export const StationTypes = {
  GAS_STATION: "GAS_STATION",
  MECHANIC: "MECHANIC",
  CAR_WASH: "CAR_WASH",
  INSPECTION: "INSPECTION",
  AUTHORIZED_SERVICE: "AUTHORIZED_SERVICE",
  PARKING: "PARKING",
} as const;

export type StationType = (typeof StationTypes)[keyof typeof StationTypes];

export const ALL_STATION_TYPES: StationType[] = [
  StationTypes.GAS_STATION,
  StationTypes.MECHANIC,
  StationTypes.CAR_WASH,
  StationTypes.INSPECTION,
  StationTypes.AUTHORIZED_SERVICE,
  StationTypes.PARKING,
];
