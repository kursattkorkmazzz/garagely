import { AssetError } from "@/features/asset/errors/asset.errors";
import { MediaFolderError } from "@/features/asset/errors/media-folder.errors";
import { StorageError } from "@/features/asset/errors/storage.errors";
import { VehicleError } from "@/features/vehicle/errors/vehicle.errors";
import { GlobalError } from "@/shared/errors/global.errors";

export type AppErrorCode =
  | GlobalError
  | StorageError
  | AssetError
  | MediaFolderError
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
