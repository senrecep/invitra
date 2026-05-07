export const DEFAULT_LOCALE = "tr-TR";
export const DEFAULT_TIMEZONE = "Europe/Istanbul";

export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
  locale = DEFAULT_LOCALE,
  timezone = DEFAULT_TIMEZONE
): string {
  return new Intl.DateTimeFormat(locale, { timeZone: timezone, ...options }).format(
    new Date(dateStr)
  );
}

export function formatRelativeDate(
  dateStr: string,
  locale = DEFAULT_LOCALE,
  timezone = DEFAULT_TIMEZONE
): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diffMin < 1) return rtf.format(0, "minute");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHrs < 24) return rtf.format(-diffHrs, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");

  return formatDate(
    dateStr,
    { day: "numeric", month: "short", year: diffDays > 365 ? "numeric" : undefined },
    locale,
    timezone
  );
}

export function formatDateLabel(
  dateStr: string,
  locale = DEFAULT_LOCALE,
  timezone = DEFAULT_TIMEZONE
): string {
  const today = new Date();
  const todayKey = today.toLocaleDateString("en-CA");
  const yesterdayKey = new Date(today.getTime() - 86400000).toLocaleDateString("en-CA");

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (dateStr === todayKey) return rtf.format(0, "day");
  if (dateStr === yesterdayKey) return rtf.format(-1, "day");

  return formatDate(dateStr + "T00:00:00", { day: "numeric", month: "long", year: "numeric" }, locale, timezone);
}
