/**
 * Dosya adını tek satıra sığacak şekilde kırpar.
 * Format: [ilk 30 karakter]...[son 3 karakter].[uzantı]
 * Basit dosya adları olduğu gibi gösterilir.
 *
 * @example
 * truncateFileName("abcdefghijklmnopqrstuvwxyz1234567", "pdf")
 * // → "abcdefghijklmnopqrst...567.pdf"
 */
export function truncateFileName(baseName: string, extension: string): string {
  const suffix = extension ? `.${extension}` : "";
  const LEAD = 20;
  const TAIL = 3;

  if (baseName.length <= LEAD + TAIL) {
    return `${baseName}${suffix}`;
  }

  const start = baseName.slice(0, LEAD);
  const end = baseName.slice(-TAIL);
  return `${start}...${end}${suffix}`;
}
