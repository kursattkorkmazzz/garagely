import { Station } from "@/features/station/entity/station.entity";
import { StationType } from "@/features/station/types/station-type";

export type StationSortKey =
  | "createdAt_desc"
  | "rating_asc"
  | "rating_desc"
  | "favorites_first";

export const ALL_STATION_SORTS: StationSortKey[] = [
  "createdAt_desc",
  "rating_desc",
  "rating_asc",
  "favorites_first",
];

export type StationFilters = {
  type: StationType | null;
  ratingMin: number | null; // 1..5
  ratingMax: number | null; // 1..5
  includeUnrated: boolean;
  favoritesOnly: boolean;
  withMediaOnly: boolean;
};

export type StationQuery = {
  filters: StationFilters;
  sort: StationSortKey;
  limit: number;
  offset: number;
};

export type StationPage = {
  items: Station[];
  hasMore: boolean;
};

export const STATION_PAGE_SIZE = 20;

export const DEFAULT_STATION_FILTERS: StationFilters = {
  type: null,
  ratingMin: null,
  ratingMax: null,
  includeUnrated: false,
  favoritesOnly: false,
  withMediaOnly: false,
};

export const DEFAULT_STATION_SORT: StationSortKey = "createdAt_desc";

/**
 * Counts the user-meaningful active filters (excluding `type`, which is
 * driven by route params and not surfaced as a chip in the filter sheet).
 * Used for the badge on the Filter button.
 */
export function countActiveFilters(filters: StationFilters): number {
  let n = 0;
  if (filters.ratingMin != null) n += 1;
  if (filters.ratingMax != null) n += 1;
  if (filters.includeUnrated) n += 1;
  if (filters.favoritesOnly) n += 1;
  if (filters.withMediaOnly) n += 1;
  return n;
}

export function hasActiveFilters(filters: StationFilters): boolean {
  return countActiveFilters(filters) > 0;
}
