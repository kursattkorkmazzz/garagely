export const UNKNOWN_MIME_TYPE = "unknown";

export enum ImageMimeTypes {
  JPEG = "image/jpeg",
  JPG = "image/jpg",
  PNG = "image/png",
}

export enum VideoMimeTypes {
  MP4 = "video/mp4",
  MOV = "video/quicktime",
}

export enum DocumentMimeTypes {
  PDF = "application/pdf",
}

export type ImageMimeType = (typeof ImageMimeTypes)[keyof typeof ImageMimeTypes];
export type VideoMimeType = (typeof VideoMimeTypes)[keyof typeof VideoMimeTypes];
export type DocumentMimeType = (typeof DocumentMimeTypes)[keyof typeof DocumentMimeTypes];

export type MimeType = ImageMimeType | VideoMimeType | DocumentMimeType;

export const MimeTypeExtentionMap: Record<MimeType, string> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
};

export const getExtensionFromMimeType = (mimeType: string): string =>
  MimeTypeExtentionMap[mimeType as MimeType] ?? UNKNOWN_MIME_TYPE;
