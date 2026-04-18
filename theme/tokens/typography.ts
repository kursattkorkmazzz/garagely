// Variant 1 (Modern Minimal) — negative tracking for headings, neutral for body.
// letterSpacing RN'de sayısal px; -0.3 gibi hassas değerleri destekler.

export const typography = {
  // Display
  display: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.8,
    lineHeight: 36,
  },

  // Headings
  heading1: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heading2: {
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  heading4: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  heading5: {
    fontSize: 15,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  heading6: {
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: 0,
    lineHeight: 18,
  },

  // Body
  bodyLarge: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },

  // Row labels (settings satırları)
  rowLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  rowValue: { fontSize: 14, fontWeight: "400" as const, lineHeight: 18 },
  rowSub: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },

  // Labels / Tags
  label: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  helperText: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  overline: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.6,
    lineHeight: 14,
  },

  // Buttons
  buttonLarge: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
  },
  buttonMedium: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
  },
  buttonSmall: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0 },
} as const;

export type Typography = keyof typeof typography;
