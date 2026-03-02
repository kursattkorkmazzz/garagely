import { EntityType } from "@garagely/shared/models/entity-type";
import multer from "multer";
import { getFileUploadLimit } from "../config/storage.config";

export function multerRestricton(entityType: EntityType) {
  const limit = getFileUploadLimit(entityType);
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: limit.fileSize,
      files: limit.files,
    },
  }).fields;
}
