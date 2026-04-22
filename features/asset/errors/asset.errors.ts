export const AssetErrors = {
  FILE_NOT_FOUND_ERROR: "FILE_NOT_FOUND_ERROR",
  FILE_PROCESSING_ERROR: "FILE_PROCESSING_ERROR",

  NOT_SUPPORTED_MIME_TYPE: "NOT_SUPPORTED_MIME_TYPE",

  MAX_FILE_SIZE_EXCEEDED: "MAX_FILE_SIZE_EXCEEDED",
} as const;

export type AssetError = (typeof AssetErrors)[keyof typeof AssetErrors];
