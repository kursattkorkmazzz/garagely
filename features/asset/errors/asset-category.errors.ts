export const AssetCategoryErrors = {
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
} as const;

export type AssetCategoryError =
  (typeof AssetCategoryErrors)[keyof typeof AssetCategoryErrors];
