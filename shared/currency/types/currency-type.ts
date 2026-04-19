export const CurrencyTypes = {
  TRY: "TRY",
  USD: "USD",
  EUR: "EUR",
} as const;

export type CurrencyType = (typeof CurrencyTypes)[keyof typeof CurrencyTypes];
