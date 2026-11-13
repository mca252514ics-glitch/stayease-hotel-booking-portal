export function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function isValidStay(checkIn, checkOut, today) {
  return isValidISODate(checkIn)
    && isValidISODate(checkOut)
    && checkIn >= today
    && checkOut > checkIn;
}

export function getNightCount(checkIn, checkOut) {
  if (!isValidISODate(checkIn) || !isValidISODate(checkOut) || checkOut <= checkIn) {
    return 0;
  }
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  return (end - start) / 86_400_000;
}

export function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
