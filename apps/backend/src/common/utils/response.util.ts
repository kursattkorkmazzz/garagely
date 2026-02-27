import type { Response } from 'express';
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '@garagely/shared/response.types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  statusCode = 200
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    meta,
  };

  res.status(statusCode).json(response);
}
