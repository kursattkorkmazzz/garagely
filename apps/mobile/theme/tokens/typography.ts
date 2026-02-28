export const typography = {
  // Headings
  heading1: { fontSize: 28, fontWeight: 700, italic: false, underline: false }, // Ana sayfa başlığı, en büyük ve önemli başlık
  heading2: { fontSize: 24, fontWeight: 700, italic: false, underline: false }, // Sayfa/section başlığı
  heading3: { fontSize: 20, fontWeight: 600, italic: false, underline: false }, // Sub-section başlığı
  heading4: { fontSize: 18, fontWeight: 600, italic: false, underline: false }, // Küçük başlık / alt başlık
  heading5: { fontSize: 16, fontWeight: 500, italic: false, underline: false }, // Daha küçük başlık, card title
  heading6: { fontSize: 14, fontWeight: 500, italic: false, underline: false }, // En küçük başlık, modal title

  // Body / Paragraphs
  bodyLarge: { fontSize: 16, fontWeight: 400, italic: false, underline: false }, // Normal metin, paragraf
  bodyMedium: {
    fontSize: 14,
    fontWeight: 400,
    italic: false,
    underline: false,
  }, // Küçük metin veya secondary content
  bodySmall: { fontSize: 12, fontWeight: 400, italic: false, underline: false }, // Yardımcı not, caption, microcopy

  // Labels / Tags
  label: { fontSize: 14, fontWeight: 500, italic: false, underline: false }, // Form input label, table header
  helperText: {
    fontSize: 12,
    fontWeight: 400,
    italic: false,
    underline: false,
  }, // Input altındaki açıklama
  caption: { fontSize: 12, fontWeight: 400, italic: false, underline: false }, // Resim altı, ekstra bilgi
  overline: { fontSize: 10, fontWeight: 500, italic: false, underline: false }, // Başlık üstü bilgi / küçük nota

  // Buttons / Interactive
  buttonLarge: {
    fontSize: 16,
    fontWeight: 600,
    italic: false,
    underline: false,
  }, // Ana aksiyon butonları
  buttonMedium: {
    fontSize: 14,
    fontWeight: 600,
    italic: false,
    underline: false,
  }, // Secondary button
  buttonSmall: {
    fontSize: 12,
    fontWeight: 600,
    italic: false,
    underline: false,
  }, // Icon button veya küçük aksiyon

  // Quotes / Code / Special Text
  quote: { fontSize: 16, fontWeight: 400, italic: true, underline: false }, // Alıntılar, blockquote
  code: { fontSize: 14, fontWeight: 400, italic: false, underline: false }, // Kod satırları, monospaced
  kbd: { fontSize: 12, fontWeight: 400, italic: false, underline: false }, // Klavye tuşu gösterimi
  mark: { fontSize: 12, fontWeight: 400, italic: false, underline: true }, // Vurgulu metin, highlight
};

export type TypographyType = keyof typeof typography;
