// Base search query
export interface SearchQuery {
  search?: string;
}

// Base pagination query
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// Combined search + pagination
export interface SearchPaginationQuery extends SearchQuery, PaginationQuery {}

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 10,
  maxPageSize: 100,
} as const;

// Helper to normalize pagination values
export function normalizePagination(
  query: PaginationQuery,
): Required<PaginationQuery> {
  const page = Math.max(1, query.page ?? PAGINATION_DEFAULTS.page);
  const pageSize = Math.min(
    PAGINATION_DEFAULTS.maxPageSize,
    Math.max(1, query.pageSize ?? PAGINATION_DEFAULTS.pageSize),
  );
  return { page, pageSize };
}
