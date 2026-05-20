import {
  addDays,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  formatDistanceToNow,
  formatRelative,
  getHours,
  isThisYear,
  isToday,
  isValid,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { Locale } from "date-fns/locale";
import { zhCN } from "date-fns/locale";

export type DateInput = Date | string | number | null | undefined;

export interface DateRange {
  start: Date;
  end: Date;
}

export function formatDateInTimeZone(
  date: DateInput,
  timeZone: string = "Asia/Shanghai",
): string {
  const dateObj = normalizeDate(date);
  if (!isValidDate(dateObj)) return "--";
  return formatInTimeZone(dateObj, timeZone, "yyyy-MM-dd HH:mm:ss");
}

export function normalizeDate(date: DateInput): Date {
  if (typeof date === "string") return parseISO(date);
  if (date === null || date === undefined) return new Date(0);
  return new Date(date);
}

export function isValidDate(date: DateInput): boolean {
  try {
    const dateObj = normalizeDate(date);
    if (compareDates(dateObj, "2000-01-01") < 0) return false;
    return isValid(dateObj);
  } catch {
    return false;
  }
}

export function formatDate(
  date: DateInput,
  formatStr: string = "yyyy-MM-dd HH:mm:ss",
): string {
  const dateObj = normalizeDate(date);
  if (!isValidDate(dateObj)) return "--";
  return format(dateObj, formatStr);
}

export function formatFullDateTime(date: DateInput): string {
  return formatDate(date, "yyyy-MM-dd HH:mm:ss");
}

export function formatShortDateTime(date: DateInput): string {
  return formatDate(date, "MM-dd HH:mm");
}

export function formatDateOnly(date: DateInput): string {
  return formatDate(date, "yyyy-MM-dd");
}

export function formatDateShort(date: DateInput): string {
  return formatDate(date, "MM-dd");
}

export function formatTimeOnly(date: DateInput): string {
  return formatDate(date, "HH:mm:ss");
}

export function formatShortTime(date: DateInput): string {
  return formatDate(date, "HH:mm");
}

export function formatChineseDate(date: DateInput): string {
  return formatDate(date, "yyyy年MM月dd日");
}

export function formatChineseDateTime(date: DateInput): string {
  return formatDate(date, "yyyy年MM月dd日 HH:mm:ss");
}

export function formatISO(date: DateInput): string {
  return normalizeDate(date).toISOString();
}

export function getTimestamp(date: DateInput): number {
  return normalizeDate(date).getTime();
}

export function formatFromNow(date: DateInput): string {
  const dateObj = normalizeDate(date);
  if (!isValid(dateObj)) return "Invalid date";
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatFromBase(date: DateInput, baseDate: DateInput): string {
  const dateObj = normalizeDate(date);
  const baseObj = normalizeDate(baseDate);
  if (!isValid(dateObj) || !isValid(baseObj)) return "Invalid date";
  return formatRelative(dateObj, baseObj);
}

export function formatSmartDate(date: DateInput): string {
  const dateObj = normalizeDate(date);
  if (!isValid(dateObj)) return "Invalid date";
  if (isToday(dateObj)) return `今天 ${format(dateObj, "HH:mm")}`;
  if (isYesterday(dateObj)) return `昨天 ${format(dateObj, "HH:mm")}`;
  if (isThisYear(dateObj)) return format(dateObj, "MM月dd日 HH:mm");
  return format(dateObj, "yyyy年MM月dd日");
}

export function formatChatTime(date: DateInput): string {
  const dateObj = normalizeDate(date);
  if (!isValid(dateObj)) return "Invalid date";
  if (isToday(dateObj)) return format(dateObj, "HH:mm");
  if (isYesterday(dateObj)) return `昨天 ${format(dateObj, "HH:mm")}`;
  if (isThisYear(dateObj)) return format(dateObj, "MM/dd HH:mm");
  return format(dateObj, "yyyy/MM/dd");
}

export function getTodayRange(): DateRange {
  const now = new Date();
  return { end: endOfDay(now), start: startOfDay(now) };
}

export function getYesterdayRange(): DateRange {
  const yesterday = subDays(new Date(), 1);
  return { end: endOfDay(yesterday), start: startOfDay(yesterday) };
}

export function getThisWeekRange(
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): DateRange {
  const now = new Date();
  return {
    end: endOfWeek(now, { weekStartsOn }),
    start: startOfWeek(now, { weekStartsOn }),
  };
}

export function getThisMonthRange(): DateRange {
  const now = new Date();
  return { end: endOfMonth(now), start: startOfMonth(now) };
}

export function getThisYearRange(): DateRange {
  const now = new Date();
  return { end: endOfYear(now), start: startOfYear(now) };
}

export function getLastDaysRange(days: number): DateRange {
  return {
    end: endOfDay(new Date()),
    start: startOfDay(subDays(new Date(), days - 1)),
  };
}

export function getNextDaysRange(days: number): DateRange {
  return {
    end: endOfDay(addDays(new Date(), days - 1)),
    start: startOfDay(new Date()),
  };
}

export function getDateRange(
  startDate: DateInput,
  endDate: DateInput,
): DateRange {
  return { end: normalizeDate(endDate), start: normalizeDate(startDate) };
}

export function formatDateRange(
  startDate: DateInput,
  endDate: DateInput,
  formatStr: string = "yyyy-MM-dd HH:mm:ss",
): string {
  return `${formatDate(startDate, formatStr)} ~ ${formatDate(endDate, formatStr)}`;
}

export function formatDateRangeShort(
  startDate: DateInput,
  endDate: DateInput,
): string {
  return `${formatDate(startDate, "MM/dd")} - ${formatDate(endDate, "MM/dd")}`;
}

export function getDaysDifference(
  date1: DateInput,
  date2: DateInput,
): number {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function isDateInRange(
  date: DateInput,
  startDate: DateInput,
  endDate: DateInput,
): boolean {
  const checkDate = normalizeDate(date).getTime();
  return (
    checkDate >= normalizeDate(startDate).getTime() &&
    checkDate <= normalizeDate(endDate).getTime()
  );
}

export function compareDates(date1: DateInput, date2: DateInput): number {
  return normalizeDate(date1).getTime() - normalizeDate(date2).getTime();
}

export function getGreeting(date?: Date | string | number): string {
  const now = date ? new Date(date) : new Date();
  const hour = getHours(now);
  if (hour < 5) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}

export function generateMonthArray(options: {
  count?: number;
  formatStr?: string;
  includeCurrent?: boolean;
  locale?: Locale;
}) {
  const {
    count = 6,
    formatStr = "yyyy-MM",
    includeCurrent = true,
    locale = zhCN,
  } = options;
  const months: Record<string, unknown>[] = [];
  const today = new Date();
  const startFrom = includeCurrent ? 0 : 1;
  for (let i = startFrom; i < count + startFrom; i++) {
    const monthDate = subMonths(today, i);
    months.push({
      date: startOfMonth(monthDate),
      label: format(monthDate, formatStr, { locale }),
      timestamp: startOfMonth(monthDate).getTime(),
      value: format(monthDate, "yyyy-MM"),
    });
  }
  return months.reverse();
}
