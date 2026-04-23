import { parseAppDate, WIB_TIME_ZONE } from "@/lib/date";

export function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return "—";

  const date = parseAppDate(dateString);
  const now = new Date();
  if (!date) return dateString;
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: WIB_TIME_ZONE,
  }).format(date);
}
