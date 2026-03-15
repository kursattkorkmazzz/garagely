const DEFAULT_LOCALE = "en-US";

export function formatDate(
  date: Date | string | null | undefined,
  locale?: string,
): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale || DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(
  date: Date | string | null | undefined,
  locale?: string,
): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale || DEFAULT_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
