import { AssetType } from "@/features/asset/types/asset-type.type";

export type UploadAssetOptions = {
  type: AssetType;
  maxSize?: number;    // in bytes
  folderId?: string | null;
};
