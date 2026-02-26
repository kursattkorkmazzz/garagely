import { ErrorCode, ErrorCodeHttpStatus } from './error.codes';

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, string[]>;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = ErrorCodeHttpStatus[options.code];
    this.details = options.details;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super({ code: ErrorCode.VALIDATION_ERROR, message, details });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super({ code: ErrorCode.NOT_FOUND, message });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super({ code: ErrorCode.UNAUTHORIZED, message });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super({ code: ErrorCode.FORBIDDEN, message });
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super({ code: ErrorCode.CONFLICT, message });
    this.name = 'ConflictError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid credentials') {
    super({ code: ErrorCode.INVALID_CREDENTIALS, message });
    this.name = 'InvalidCredentialsError';
  }
}
