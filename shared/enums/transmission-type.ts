export const TransmissionTypes = {
  MANUAL: "manual",
  AUTOMATIC: "automatic",
  SEMI_AUTOMATIC: "semi_automatic",
  CVT: "cvt",
} as const;

export type TransmissionType = (typeof TransmissionTypes)[keyof typeof TransmissionTypes];
