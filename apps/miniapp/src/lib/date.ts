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

export function formatDateInTimeZone(date: DateInput, timeZone: string = "Asia/Shanghai"): string {
	const dateObj = normalizeDate(date);
	if (!isValidDate(dateObj)) {
		return "--";
	}
	return formatInTimeZone(dateObj, timeZone, "yyyy-MM-dd HH:mm:ss");
}

/**
 * 标准化日期输入
 */
export function normalizeDate(date: DateInput): Date {
	if (typeof date === "string") {
		return parseISO(date);
	}
	if (date === null || date === undefined) {
		return new Date(0);
	}
	return new Date(date);
}

/**
 * 验证日期是否有效
 */
export function isValidDate(date: DateInput): boolean {
	try {
		const dateObj = normalizeDate(date);
		if (compareDates(dateObj, "2000-01-01") < 0) {
			return false;
		}
		return isValid(dateObj);
	} catch {
		return false;
	}
}

/**
 * 基础格式化函数
 */
export function formatDate(date: DateInput, formatStr: string = "yyyy-MM-dd HH:mm:ss"): string {
	const dateObj = normalizeDate(date);
	if (!isValidDate(dateObj)) {
		return "--";
	}
	return format(dateObj, formatStr);
}

/**
 * 完整日期时间 (2023-12-25 14:30:45)
 */
export function formatFullDateTime(date: DateInput): string {
	return formatDate(date, "yyyy-MM-dd HH:mm:ss");
}

/**
 * 短日期时间 (12-25 14:30)
 */
export function formatShortDateTime(date: DateInput): string {
	return formatDate(date, "MM-dd HH:mm");
}

/**
 * 仅日期 (2023-12-25)
 */
export function formatDateOnly(date: DateInput): string {
	return formatDate(date, "yyyy-MM-dd");
}

/**
 * 短日期 (12-25)
 */
export function formatDateShort(date: DateInput): string {
	return formatDate(date, "MM-dd");
}

/**
 * 仅时间 (14:30:45)
 */
export function formatTimeOnly(date: DateInput): string {
	return formatDate(date, "HH:mm:ss");
}

/**
 * 短时间 (14:30)
 */
export function formatShortTime(date: DateInput): string {
	return formatDate(date, "HH:mm");
}

/**
 * 中文日期 (2023年12月25日)
 */
export function formatChineseDate(date: DateInput): string {
	return formatDate(date, "yyyy年MM月dd日");
}

/**
 * 中文日期时间 (2023年12月25日 14:30:45)
 */
export function formatChineseDateTime(date: DateInput): string {
	return formatDate(date, "yyyy年MM月dd日 HH:mm:ss");
}

/**
 * 月份名称 (December 25, 2023)
 */
export function formatMonthName(date: DateInput): string {
	return formatDate(date, "MMMM dd, yyyy");
}

/**
 * 星期几 (Monday, December 25, 2023)
 */
export function formatDayOfWeek(date: DateInput): string {
	return formatDate(date, "EEEE, MMMM dd, yyyy");
}

/**
 * ISO格式 (2023-12-25T14:30:45.000Z)
 */
export function formatISO(date: DateInput): string {
	return normalizeDate(date).toISOString();
}

/**
 * 时间戳 (毫秒)
 */
export function getTimestamp(date: DateInput): number {
	return normalizeDate(date).getTime();
}

/**
 * 相对当前时间 (2 hours ago, in 3 days)
 */
export function formatFromNow(date: DateInput): string {
	const dateObj = normalizeDate(date);
	if (!isValid(dateObj)) return "Invalid date";
	return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * 相对于基准时间的相对时间
 */
export function formatFromBase(date: DateInput, baseDate: DateInput): string {
	const dateObj = normalizeDate(date);
	const baseObj = normalizeDate(baseDate);
	if (!isValid(dateObj) || !isValid(baseObj)) return "Invalid date";
	return formatRelative(dateObj, baseObj);
}

/**
 * 智能日期显示
 * - 今天: 今天 14:30
 * - 昨天: 昨天 14:30
 * - 今年: 12月25日 14:30
 * - 其他年份: 2023年12月25日
 */
export function formatSmartDate(date: DateInput): string {
	const dateObj = normalizeDate(date);
	if (!isValid(dateObj)) return "Invalid date";

	if (isToday(dateObj)) {
		return `今天 ${format(dateObj, "HH:mm")}`;
	} else if (isYesterday(dateObj)) {
		return `昨天 ${format(dateObj, "HH:mm")}`;
	} else if (isThisYear(dateObj)) {
		return format(dateObj, "MM月dd日 HH:mm");
	} else {
		return format(dateObj, "yyyy年MM月dd日");
	}
}

/**
 * 聊天时间显示
 * - 今天: 14:30
 * - 昨天: 昨天 14:30
 * - 一周内: 星期一 14:30
 * - 其他: 2023/12/25
 */
export function formatChatTime(date: DateInput): string {
	const dateObj = normalizeDate(date);
	if (!isValid(dateObj)) return "Invalid date";

	if (isToday(dateObj)) {
		return format(dateObj, "HH:mm");
	} else if (isYesterday(dateObj)) {
		return `昨天 ${format(dateObj, "HH:mm")}`;
	} else if (isThisYear(dateObj)) {
		return format(dateObj, "MM/dd HH:mm");
	} else {
		return format(dateObj, "yyyy/MM/dd");
	}
}

/**
 * 今天的时间范围
 */
export function getTodayRange(): DateRange {
	const now = new Date();
	return {
		end: endOfDay(now),
		start: startOfDay(now),
	};
}

/**
 * 昨天的时间范围
 */
export function getYesterdayRange(): DateRange {
	const yesterday = subDays(new Date(), 1);
	return {
		end: endOfDay(yesterday),
		start: startOfDay(yesterday),
	};
}

/**
 * 明天的时间范围
 */
export function getTomorrowRange(): DateRange {
	const tomorrow = addDays(new Date(), 1);
	return {
		end: endOfDay(tomorrow),
		start: startOfDay(tomorrow),
	};
}

/**
 * 本周时间范围 (周一作为开始)
 */
export function getThisWeekRange(weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): DateRange {
	const now = new Date();
	return {
		end: endOfWeek(now, { weekStartsOn }),
		start: startOfWeek(now, { weekStartsOn }),
	};
}

/**
 * 本月时间范围
 */
export function getThisMonthRange(): DateRange {
	const now = new Date();
	return {
		end: endOfMonth(now),
		start: startOfMonth(now),
	};
}

/**
 * 今年时间范围
 */
export function getThisYearRange(): DateRange {
	const now = new Date();
	return {
		end: endOfYear(now),
		start: startOfYear(now),
	};
}

/**
 * 最近N天
 */
export function getLastDaysRange(days: number): DateRange {
	return {
		end: endOfDay(new Date()),
		start: startOfDay(subDays(new Date(), days - 1)),
	};
}

/**
 * 未来N天
 */
export function getNextDaysRange(days: number): DateRange {
	return {
		end: endOfDay(addDays(new Date(), days - 1)),
		start: startOfDay(new Date()),
	};
}

/**
 * 自定义日期范围
 */
export function getDateRange(startDate: DateInput, endDate: DateInput): DateRange {
	return {
		end: normalizeDate(endDate),
		start: normalizeDate(startDate),
	};
}

/**
 * 格式化日期范围
 */
export function formatDateRange(
	startDate: DateInput,
	endDate: DateInput,
	formatStr: string = "yyyy-MM-dd HH:mm:ss",
): string {
	const start = formatDate(startDate, formatStr);
	const end = formatDate(endDate, formatStr);
	return `${start} ~ ${end}`;
}

/**
 * 格式化日期范围 (简写)
 */
export function formatDateRangeShort(startDate: DateInput, endDate: DateInput): string {
	const start = formatDate(startDate, "MM/dd");
	const end = formatDate(endDate, "MM/dd");
	return `${start} - ${end}`;
}

/**
 * 获取两个日期之间的天数差
 */
export function getDaysDifference(date1: DateInput, date2: DateInput): number {
	const d1 = normalizeDate(date1);
	const d2 = normalizeDate(date2);
	const diffTime = Math.abs(d2.getTime() - d1.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 检查日期是否在范围内
 */
export function isDateInRange(date: DateInput, startDate: DateInput, endDate: DateInput): boolean {
	const checkDate = normalizeDate(date).getTime();
	const start = normalizeDate(startDate).getTime();
	const end = normalizeDate(endDate).getTime();
	return checkDate >= start && checkDate <= end;
}

/**
 * 日期比较函数
 */
export function compareDates(date1: DateInput, date2: DateInput): number {
	const d1 = normalizeDate(date1).getTime();
	const d2 = normalizeDate(date2).getTime();
	return d1 - d2;
}

/**
 * 获取最小日期
 */
export function minDate(...dates: DateInput[]): Date {
	const normalized = dates.map(normalizeDate);
	return new Date(Math.min(...normalized.map((d) => d.getTime())));
}

/**
 * 获取最大日期
 */
export function maxDate(...dates: DateInput[]): Date {
	const normalized = dates.map(normalizeDate);
	return new Date(Math.max(...normalized.map((d) => d.getTime())));
}

export function getGreeting(date?: Date | string | number): string {
	const now = date ? new Date(date) : new Date();
	const hour = getHours(now);

	if (hour < 5) {
		return "夜深了";
	} else if (hour < 9) {
		return "早上好";
	} else if (hour < 12) {
		return "上午好";
	} else if (hour < 14) {
		return "中午好";
	} else if (hour < 18) {
		return "下午好";
	} else if (hour < 22) {
		return "晚上好";
	} else {
		return "夜深了";
	}
}

export interface GreetingInfo {
	greeting: string;
	period: "morning" | "forenoon" | "noon" | "afternoon" | "evening" | "night" | "lateNight";
	periodStart: Date;
	periodEnd: Date;
	nextPeriod: string;
	minutesToNextPeriod: number;
}

export function getGreetingInfo(date?: Date | string | number): GreetingInfo {
	const now = date ? new Date(date) : new Date();
	const hour = getHours(now);

	const periods = [
		{ end: 5, greeting: "夜深了", name: "lateNight", start: 0 },
		{ end: 9, greeting: "早上好", name: "morning", start: 5 },
		{ end: 12, greeting: "上午好", name: "forenoon", start: 9 },
		{ end: 14, greeting: "中午好", name: "noon", start: 12 },
		{ end: 18, greeting: "下午好", name: "afternoon", start: 14 },
		{ end: 22, greeting: "晚上好", name: "evening", start: 18 },
		{ end: 24, greeting: "晚安", name: "night", start: 22 },
	];

	const currentPeriod = periods.find((p) => hour >= p.start && hour < p.end) || periods[0];
	const nextPeriod = periods.find((p) => p.start > hour) || periods[0];

	const periodStart = new Date(now);
	periodStart.setHours(currentPeriod?.start || 0, 0, 0, 0);
	const periodEnd = new Date(now);
	periodEnd.setHours(currentPeriod?.end || 0, 0, 0, 0);

	const nextPeriodStart = new Date(now);
	nextPeriodStart.setHours(nextPeriod?.start || 0, 0, 0, 0);

	return {
		greeting: currentPeriod?.greeting || "",
		minutesToNextPeriod: differenceInMinutes(nextPeriodStart, now),
		nextPeriod: nextPeriod?.greeting || "",
		period: currentPeriod?.name as GreetingInfo["period"],
		periodEnd,
		periodStart,
	};
}

export function generateGreetingCard(
	username?: string,
	date?: Date | string | number,
): {
	title: string;
	message: string;
	icon: string;
	color: string;
} {
	const now = date ? new Date(date) : new Date();
	const greetingInfo = getGreetingInfo(now);

	const configs = {
		afternoon: {
			color: "#2196F3", // 蓝色
			icon: "☕",
			message: username ? `${username}，来杯咖啡提提神？` : "来杯咖啡，继续加油！",
			title: "⚡ 下午茶时间",
		},
		evening: {
			color: "#9C27B0", // 紫色
			icon: "🏙️",
			message: username ? `${username}，今天过得怎么样？` : "放松一下，回顾今天的收获",
			title: "🌇 傍晚时分",
		},
		forenoon: {
			color: "#4CAF50", // 绿色
			icon: "💼",
			message: username ? `${username}，保持专注哦！` : "保持专注，提高效率！",
			title: "📈 高效工作时段",
		},
		lateNight: {
			color: "#303030", // 深灰色
			icon: "🌌",
			message: username ? `${username}，别熬夜太晚哦！` : "夜深了，注意休息",
			title: "🌃 夜深人静",
		},
		morning: {
			color: "#FFB74D", // 橙色
			icon: "☀️",
			message: username ? `${username}，新的一天开始啦！` : "新的一天开始啦！",
			title: "� 一日之计在于晨",
		},
		night: {
			color: "#673AB7", // 深紫色
			icon: "🌙",
			message: username ? `${username}，早点休息哦！` : "早点休息，明天会更好！",
			title: "🌙 晚安时刻",
		},
		noon: {
			color: "#FF9800", // 橙色
			icon: "🍲",
			message: username ? `${username}，记得好好吃饭！` : "记得好好吃饭，补充能量！",
			title: "🍽️ 午餐时间",
		},
	};

	const config = configs[greetingInfo.period];

	return {
		color: config.color,
		icon: config.icon,
		message: config.message,
		title: config.title,
	};
}

export function generateMonthArray(options: {
	count?: number;
	formatStr?: string;
	includeCurrent?: boolean;
	locale?: Locale;
}) {
	const { count = 6, formatStr = "yyyy-MM", includeCurrent = true, locale = zhCN } = options;

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

	return months.reverse(); // 从旧到新排序
}
