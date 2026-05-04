import dayjs from "@/utils/dayjs";
import { type Language, Languages } from "@/shared/languages";

export type DateParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
};

export function utcToLocal(utcMs: number, tz: string): DateParts {
  const d = dayjs.utc(utcMs).tz(tz);
  return {
    year: d.year(),
    month: d.month() + 1,
    day: d.date(),
    hour: d.hour(),
    minute: d.minute(),
  };
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

export function formatDate(utcMs: number, tz: string, lang: Language): string {
  const d = dayjs.utc(utcMs).tz(tz);
  const dd = String(d.date()).padStart(2, "0");
  const mm = String(d.month() + 1).padStart(2, "0");
  const yyyy = d.year();
  if (lang === Languages.TR) return `${dd}/${mm}/${yyyy}`;
  return `${dd}/${mm}/${yyyy}`;
}

export function formatTime(utcMs: number, tz: string): string {
  const d = dayjs.utc(utcMs).tz(tz);
  return `${String(d.hour()).padStart(2, "0")}:${String(d.minute()).padStart(2, "0")}`;
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
