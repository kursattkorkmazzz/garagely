export const StationErrors = {
  STATION_NOT_FOUND: "STATION_NOT_FOUND",
  INVALID_STATION_NAME: "INVALID_STATION_NAME",
  INVALID_RATING: "INVALID_RATING",
  MEDIA_NOT_IN_STATION: "MEDIA_NOT_IN_STATION",
} as const;

export type StationError = (typeof StationErrors)[keyof typeof StationErrors];
