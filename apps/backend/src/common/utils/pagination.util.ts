import type { Request } from "express";
import type { SearchPaginationQuery } from "@garagely/shared/query.types";
import {
  normalizePagination,
  buildPaginationMeta,
  PAGINATION_DEFAULTS,
} from "@garagely/shared/query.types";

export { buildPaginationMeta };

export function extractSearchPaginationQuery(
  req: Request,
): Required<SearchPaginationQuery> {
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string, 10) || PAGINATION_DEFAULTS.page;
  const limit =
    parseInt(req.query.limit as string, 10) || PAGINATION_DEFAULTS.limit;

  const normalized = normalizePagination({ page, limit });

  return {
    search,
    ...normalized,
  };
}
