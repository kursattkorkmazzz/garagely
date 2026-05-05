export const TagErrors = {
  TAG_NOT_FOUND: "TAG_NOT_FOUND",
  TAG_NAME_INVALID: "TAG_NAME_INVALID",
  TAG_NAME_TOO_LONG: "TAG_NAME_TOO_LONG",
  TAG_NAME_ALREADY_EXISTS: "TAG_NAME_ALREADY_EXISTS",
} as const;

export type TagError = (typeof TagErrors)[keyof typeof TagErrors];
