export const typography = {
  // Headings
  heading1: { fontSize: 28, fontWeight: "700" as const },
  heading2: { fontSize: 24, fontWeight: "700" as const },
  heading3: { fontSize: 20, fontWeight: "600" as const },
  heading4: { fontSize: 18, fontWeight: "600" as const },
  heading5: { fontSize: 16, fontWeight: "500" as const },
  heading6: { fontSize: 14, fontWeight: "500" as const },

  // Body / Paragraphs
  bodyLarge: { fontSize: 16, fontWeight: "400" as const },
  bodyMedium: { fontSize: 14, fontWeight: "400" as const },
  bodySmall: { fontSize: 12, fontWeight: "400" as const },

  // Labels / Tags
  label: { fontSize: 14, fontWeight: "500" as const },
  helperText: { fontSize: 12, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
  overline: { fontSize: 10, fontWeight: "500" as const },

  // Buttons / Interactive
  buttonLarge: { fontSize: 16, fontWeight: "600" as const },
  buttonMedium: { fontSize: 14, fontWeight: "600" as const },
  buttonSmall: { fontSize: 12, fontWeight: "600" as const },
} as const;

export type Typography = keyof typeof typography;
