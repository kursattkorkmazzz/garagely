import { EntityType } from "@garagely/shared/models/entity-type";

interface StorageLimits {
  maxFileSize: number;
}

const MB = 1024 * 1024;

const defaultLimits: Record<EntityType, StorageLimits> = {
  [EntityType.USER_PROFILE]: { maxFileSize: 10 * MB },
};

function parseEnvSize(envVar: string | undefined, defaultSize: number): number {
  if (!envVar) return defaultSize;
  const parsed = parseInt(envVar, 10);
  return isNaN(parsed) ? defaultSize : parsed * MB;
}

export function getStorageLimits(entityType: EntityType): StorageLimits {
  const envKey = `STORAGE_MAX_SIZE_${entityType.toUpperCase()}`;
  const envValue = process.env[envKey];

  return {
    maxFileSize: parseEnvSize(envValue, defaultLimits[entityType].maxFileSize),
  };
}

export function getMaxUploadSize(): number {
  const allLimits = Object.values(EntityType).map(
    (type) => getStorageLimits(type).maxFileSize,
  );
  return Math.max(...allLimits);
}
