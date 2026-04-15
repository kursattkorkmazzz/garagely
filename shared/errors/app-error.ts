import { GlobalError } from "@/shared/errors/global.errors";

export class AppError {
  message?: string;
  errorCode: GlobalError | string;
  details?: Record<string, any>;

  constructor(
    message: string,
    errorCode: GlobalError | string,
    details?: Record<string, any>,
  ) {
    this.message = message;
    this.errorCode = errorCode;
    this.details = details;
  }

  static createAppError(
    message: string,
    errorCode: GlobalError | string,
    details?: Record<string, any>,
  ): AppError {
    return new AppError(message, errorCode, details);
  }
}
