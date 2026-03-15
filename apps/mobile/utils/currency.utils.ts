import { Currency } from "@garagely/shared/models/unit";

export function getCurrencySymbol(currency: Currency | undefined): string {
  switch (currency) {
    case Currency.EUR:
      return "\u20AC";
    case Currency.GBP:
      return "\u00A3";
    case Currency.TRY:
      return "\u20BA";
    case Currency.USD:
    default:
      return "$";
  }
}

export function formatPrice(
  price: number | null | undefined,
  currencySymbol: string,
): string | null {
  if (price === null || price === undefined) return null;
  return `${currencySymbol}${price.toLocaleString()}`;
}
