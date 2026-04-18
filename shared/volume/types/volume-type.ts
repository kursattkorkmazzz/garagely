export const VolumeTypes = {
  L: "L",
  GAL: "gal",
} as const;

export type VolumeType = (typeof VolumeTypes)[keyof typeof VolumeTypes];
