export function withOpacity(rgb: string, opacityValue: number) {
  const opacity = Math.min(Math.max(opacityValue, 0), 1); // Ensure opacity is between 0 and 1

  const colorValue = rgb.replaceAll("#", "").trim();
  if (colorValue.length === 3) {
    const r = parseInt(colorValue[0] + colorValue[0], 16);
    const g = parseInt(colorValue[1] + colorValue[1], 16);
    const b = parseInt(colorValue[2] + colorValue[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (colorValue.length === 6) {
    const r = parseInt(colorValue.slice(0, 2), 16);
    const g = parseInt(colorValue.slice(2, 4), 16);
    const b = parseInt(colorValue.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else {
    throw new Error("Invalid RGB color format. Expected #RGB or #RRGGBB.");
  }
}
