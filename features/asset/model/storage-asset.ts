import { MimeType } from "@/features/asset/types/mime-type.type";

export type StorageAsset = {
  fullPath: string;
  basePath: string;
  baseName: string;
  extension: string;
  fullName: string;
  mimeType: MimeType;
  sizeBytes: number;
  isTemp: boolean;
};
