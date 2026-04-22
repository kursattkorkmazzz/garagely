export const UNKNOWN_MIME_TYPE = "unknown";

export enum ImageMimeTypes {
  JPEG = "image/jpeg",
  JPG = "image/jpg",
  PNG = "image/png",
}

export type ImageMimeType =
  (typeof ImageMimeTypes)[keyof typeof ImageMimeTypes];

export type MimeType = ImageMimeType; // Şimdilik sadece image, ileride video, document vs. eklenebilir

export const MimeTypeExtentionMap: Record<MimeType, string> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
};

export const getExtensionFromMimeType = (mimeType: string): string =>
  MimeTypeExtentionMap[mimeType as MimeType] ?? UNKNOWN_MIME_TYPE;
