import type { Request } from "express";
import type { PaginationMeta } from "@garagely/shared/response.types";
import type { SearchPaginationQuery } from "@garagely/shared/query.types";
import {
  normalizePagination,
  PAGINATION_DEFAULTS,
} from "@garagely/shared/query.types";

export function extractSearchPaginationQuery(
  req: Request,
): Required<SearchPaginationQuery> {
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string, 10) || PAGINATION_DEFAULTS.page;
  const pageSize =
    parseInt(req.query.pageSize as string, 10) || PAGINATION_DEFAULTS.pageSize;

  const normalized = normalizePagination({ page, pageSize });

  return {
    search,
    ...normalized,
  };
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    limit: pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
