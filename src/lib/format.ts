export function formatCurrency(value: number, digits = 0) {
  return Number(value.toFixed(digits)).toLocaleString("en");
}

export function formatTime(total: number) {
  const hours = (total / (60 * 60)) | 0;
  const minutes = ((total % (60 * 60)) / 60) | 0;

  let result = "";
  if (hours > 0) {
    result += `${hours} ${hours === 1 ? "hour" : "hours"} and `;
  }
  if (minutes > 0) {
    result += `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }

  return result;
}
