export const MediaFolderErrors = {
  FOLDER_NOT_FOUND:   "FOLDER_NOT_FOUND",
  CIRCULAR_REFERENCE: "CIRCULAR_REFERENCE",
  NAME_ALREADY_EXISTS: "NAME_ALREADY_EXISTS_FOLDER",
  INVALID_NAME:        "INVALID_FOLDER_NAME",
  NAME_TOO_LONG:       "FOLDER_NAME_TOO_LONG",
} as const;

export type MediaFolderError =
  (typeof MediaFolderErrors)[keyof typeof MediaFolderErrors];
