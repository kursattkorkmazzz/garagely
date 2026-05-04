import dayjs from "@/utils/dayjs";
import { type Language, Languages } from "@/shared/languages";

export type DateParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
};

function intlParts(utcMs: number, tz: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(utcMs));
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function utcToLocal(utcMs: number, tz: string): DateParts {
  return intlParts(utcMs, tz);
}

export function localToUtc(parts: DateParts, tz: string): number {
  const yyyy = String(parts.year).padStart(4, "0");
  const mm = String(parts.month).padStart(2, "0");
  const dd = String(parts.day).padStart(2, "0");
  const hh = String(parts.hour).padStart(2, "0");
  const mi = String(parts.minute).padStart(2, "0");
  return dayjs.tz(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00`, tz).valueOf();
}

export function daysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month).padStart(2, "0")}-01`).daysInMonth();
}

export function formatDate(utcMs: number, tz: string, _lang: Language): string {
  const { day, month, year } = intlParts(utcMs, tz);
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${dd}/${mm}/${year}`;
}

export function formatTime(utcMs: number, tz: string): string {
  const { hour, minute } = intlParts(utcMs, tz);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatDateTime(
  utcMs: number,
  tz: string,
  lang: Language,
): string {
  return `${formatDate(utcMs, tz, lang)}  ${formatTime(utcMs, tz)}`;
}

export function datePlaceholder(lang: Language): string {
  return lang === Languages.TR ? "GG/AA/YYYY" : "DD/MM/YYYY";
}

export function timePlaceholder(lang: Language): string {
  return lang === Languages.TR ? "SS:DD" : "HH:MM";
}

export function dateTimePlaceholder(lang: Language): string {
  return `${datePlaceholder(lang)}  ${timePlaceholder(lang)}`;
}
