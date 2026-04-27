import { AssetCategoryError } from "@/features/asset/errors/asset-category.errors";
import { AssetError } from "@/features/asset/errors/asset.errors";
import { StorageError } from "@/features/asset/errors/storage.errors";
import { VehicleError } from "@/features/vehicle/errors/vehicle.errors";
import { GlobalError } from "@/shared/errors/global.errors";

export type AppErrorCode =
  | GlobalError
  | StorageError
  | AssetError
  | AssetCategoryError
  | VehicleError;

export class AppError {
  message?: string;
  errorCode: AppErrorCode;
  details?: Record<string, any>;

  constructor(
    errorCode: AppErrorCode,
    message?: string,
    details?: Record<string, any>,
  ) {
    this.message = message;
    this.errorCode = errorCode;
    this.details = details;
  }

  static createAppError(
    errorCode: AppErrorCode,
    message?: string,
    details?: Record<string, any>,
  ): AppError {
    return new AppError(errorCode, message, details);
  }
}
