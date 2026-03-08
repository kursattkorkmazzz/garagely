// Brand IDs - exported for reference in models
export const BRAND_IDS = {
  MITSUBISHI: "a868d6b9-5238-4674-a64b-1e4490626783",
} as const;

export const brandsSeed = [
  {
    id: BRAND_IDS.MITSUBISHI,
    name: "Mitsubishi",
    nameLower: "mitsubishi",
    logoUrl: null,
    isSystem: true,
    isActive: true,
  },
];
