import type { PaginationMeta } from "./response.types.js";

// Base search query
export interface SearchQuery {
  search?: string;
}

// Base pagination query
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Combined search + pagination
export interface SearchPaginationQuery extends SearchQuery, PaginationQuery {}

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;

// Helper to normalize pagination values
export function normalizePagination(
  query: PaginationQuery,
): Required<PaginationQuery> {
  const page = Math.max(1, query.page ?? PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, query.limit ?? PAGINATION_DEFAULTS.limit),
  );
  return { page, limit };
}

// Build pagination meta from query results
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
