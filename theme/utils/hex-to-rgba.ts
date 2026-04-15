export function hexToRgba(hex: string, alpha: number = 1) {
  const clean = hex.replace("#", "");

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
