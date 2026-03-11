import { EntityType } from "@garagely/shared/models/entity-type";

/**
 * Creates a React Native compatible file object for FormData uploads.
 * React Native requires a specific format that differs from web File API.
 */
export function createReactNativeFile(uri: string, entityType: EntityType): Blob {
  const uriParts = uri.split(".");
  const extension = uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";

  return {
    uri,
    type: mimeType,
    name: `${entityType}.${extension}`,
  } as unknown as Blob;
}
