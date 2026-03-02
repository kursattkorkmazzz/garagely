import { EntityType } from "@garagely/shared/models/entity-type";

type StorageLimits = {
  fileSize: number; // in bytes
  files: number; // max number of files
};

const MB = 1024 * 1024;

const defaultLimits: Record<EntityType, StorageLimits> = {
  [EntityType.USER_PROFILE]: { fileSize: 10 * MB, files: 1 },
};

function parseEnvSize(envVar: string | undefined, defaultSize: number): number {
  if (!envVar) return defaultSize;
  const parsed = parseInt(envVar, 10);
  return isNaN(parsed) ? defaultSize : parsed * MB;
}

export function getStorageLimits(entityType: EntityType): StorageLimits {
  const sizeEnvKey = `STORAGE_MAX_SIZE_${entityType.toUpperCase()}`;
  const fileCountEnvKey = `STORAGE_MAX_FILE_COUNT_${entityType.toUpperCase()}`;
  const envValue = process.env[sizeEnvKey];
  const fileCountEnvValue = process.env[fileCountEnvKey];

  return {
    fileSize: parseEnvSize(envValue, defaultLimits[entityType].fileSize),
    files: parseEnvSize(fileCountEnvValue, defaultLimits[entityType].files),
  };
}

export function getFileUploadLimit(entityType: EntityType): StorageLimits {
  return defaultLimits[entityType];
}
