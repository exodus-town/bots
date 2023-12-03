export function format(value: number, digits = 0) {
  return Number(value.toFixed(digits)).toLocaleString("en");
}
