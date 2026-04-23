export const WIB_TIME_ZONE = "Asia/Jakarta";

export function parseAppDate(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)
    ? trimmed.replace(" ", "T") + "Z"
    : trimmed;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = parseAppDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: WIB_TIME_ZONE,
  }).format(date);
}
