import { StationType } from "@/features/station/types/station-type";

export const STATION_TAG_SCOPE_PREFIX = "station";

export function stationTagScope(type: StationType): string {
  return `${STATION_TAG_SCOPE_PREFIX}:${type}`;
}

export function isStationTagScope(scope: string): boolean {
  return scope.startsWith(`${STATION_TAG_SCOPE_PREFIX}:`);
}

export function parseStationTagScope(scope: string): StationType | null {
  if (!isStationTagScope(scope)) return null;
  return scope.slice(STATION_TAG_SCOPE_PREFIX.length + 1) as StationType;
}
