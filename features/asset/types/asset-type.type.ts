export enum AssetTypes {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  GENERIC = "GENERIC",
}

export type AssetType = (typeof AssetTypes)[keyof typeof AssetTypes];
