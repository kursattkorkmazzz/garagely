import type { Request, Response, NextFunction } from "express";
import { AppError } from "@garagely/shared/error.types";
import { ErrorCode } from "@garagely/shared/error.codes";
import { logger } from "../logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: "An unexpected error occurred",
    },
  });
}
