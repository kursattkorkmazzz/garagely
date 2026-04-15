export const Languages = {
  EN: "en",
  TR: "tr",
} as const;

export type Language = (typeof Languages)[keyof typeof Languages];
