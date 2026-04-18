export function withOpacity(variable: string, opacityValue: number) {
  const opacity = Math.min(Math.max(opacityValue, 0), 1); // Ensure opacity is between 0 and 1
  return `rgba(var(${variable}), ${opacity})`;
}
