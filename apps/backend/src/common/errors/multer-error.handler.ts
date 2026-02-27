import { MulterError } from "multer";
import { ErrorCode } from "@garagely/shared/error.codes";
import { AppError } from "@garagely/shared/error.types";

interface MulterErrorMapping {
  code: ErrorCode;
  message: string;
}

const multerErrorMappings: Record<string, MulterErrorMapping> = {
  LIMIT_FILE_SIZE: {
    code: ErrorCode.FILE_TOO_LARGE,
    message: "File is too large",
  },
  LIMIT_FILE_COUNT: {
    code: ErrorCode.TOO_MANY_FILES,
    message: "Too many files",
  },
  LIMIT_UNEXPECTED_FILE: {
    code: ErrorCode.TOO_MANY_FILES,
    message: "File limit exceeded",
  },
  LIMIT_PART_COUNT: {
    code: ErrorCode.FILE_UPLOAD_ERROR,
    message: "Too many parts",
  },
  LIMIT_FIELD_KEY: {
    code: ErrorCode.FILE_UPLOAD_ERROR,
    message: "Field name is too long",
  },
  LIMIT_FIELD_VALUE: {
    code: ErrorCode.FILE_UPLOAD_ERROR,
    message: "Field value is too long",
  },
  LIMIT_FIELD_COUNT: {
    code: ErrorCode.FILE_UPLOAD_ERROR,
    message: "Too many fields",
  },
};

export function isMulterError(err: Error): err is MulterError {
  return err instanceof MulterError;
}

export function convertMulterError(err: MulterError): AppError {
  const mapping = multerErrorMappings[err.code];

  if (mapping) {
    return new AppError({
      code: mapping.code,
      message: mapping.message,
      details: err.field ? { [err.field]: [mapping.message] } : undefined,
    });
  }

  return new AppError({
    code: ErrorCode.FILE_UPLOAD_ERROR,
    message: "File upload error",
  });
}
