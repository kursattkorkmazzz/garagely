import * as yup from "yup";

export enum Currency {
  USD = "usd",
  EUR = "eur",
  GBP = "gbp",
  TRY = "try",
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  [Currency.USD]: "US Dollar",
  [Currency.EUR]: "Euro",
  [Currency.GBP]: "British Pound",
  [Currency.TRY]: "Turkish Lira",
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: "$",
  [Currency.EUR]: "\u20AC",
  [Currency.GBP]: "\u00A3",
  [Currency.TRY]: "\u20BA",
};

export const currencyValidator = yup
  .string()
  .oneOf(Object.values(Currency) as Currency[])
  .required();
