export interface CurrencyFormatOptions {
	locale?: string;
	currency?: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	useGrouping?: boolean; // 是否使用千位分隔符
	notation?: "standard" | "scientific" | "engineering" | "compact";
	compactDisplay?: "short" | "long";
	signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
	style?: "decimal" | "currency" | "percent" | "unit";
}

export interface FormattedAmount {
	original: number;
	formatted: string;
	parts: {
		integer: string;
		decimal?: string;
		currency?: string;
		sign?: string;
	};
	isNegative: boolean;
	currency: string;
}

export interface CurrencyConfig {
	code: string;
	symbol: string;
	name: string;
	decimalDigits: number;
}

// 常见货币配置
export const CURRENCIES: Record<string, CurrencyConfig> = {
	CNY: { code: "CNY", decimalDigits: 2, name: "人民币", symbol: "¥" },
	EUR: { code: "EUR", decimalDigits: 2, name: "欧元", symbol: "€" },
	GBP: { code: "GBP", decimalDigits: 2, name: "英镑", symbol: "£" },
	JPY: { code: "JPY", decimalDigits: 0, name: "日元", symbol: "¥" },
	KRW: { code: "KRW", decimalDigits: 0, name: "韩元", symbol: "₩" },
	USD: { code: "USD", decimalDigits: 2, name: "美元", symbol: "$" },
};

/**
 * 基础金额格式化函数
 */
export const formatAmount = (
	amount: number | string,
	options: CurrencyFormatOptions = {},
): string => {
	const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

	if (Number.isNaN(numAmount)) {
		return "--";
	}

	const {
		locale = "zh-CN",
		currency = "CNY",
		style = "currency",
		minimumFractionDigits = 2,
		maximumFractionDigits = 2,
		useGrouping = true,
		notation = "standard",
		compactDisplay = "short",
		signDisplay = "auto",
	} = options;

	// ensure signDisplay matches Intl.NumberFormatOptions type (casts unknown/extra values)
	const signDisplayOption = signDisplay as unknown as Intl.NumberFormatOptions["signDisplay"];

	const formatter = new Intl.NumberFormat(locale, {
		compactDisplay,
		currency,
		maximumFractionDigits,
		minimumFractionDigits,
		notation,
		signDisplay: signDisplayOption,
		style,
		useGrouping,
	});

	return formatter.format(numAmount);
};

/**
 * 获取格式化的金额部分信息
 */
export const formatAmountWithParts = (
	amount: number | string,
	options: CurrencyFormatOptions = {},
): FormattedAmount => {
	const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

	if (Number.isNaN(numAmount)) {
		throw new Error("无效的金额数值");
	}

	const {
		locale = "zh-CN",
		currency = "CNY",
		minimumFractionDigits = 2,
		maximumFractionDigits = 2,
		useGrouping = true,
	} = options;

	const formatter = new Intl.NumberFormat(locale, {
		currency,
		maximumFractionDigits,
		minimumFractionDigits,
		style: "currency",
		useGrouping,
	});

	const parts = formatter.formatToParts(numAmount);
	const result: Partial<FormattedAmount["parts"]> = {};

	parts.forEach((part) => {
		switch (part.type) {
			case "integer":
				result.integer = part.value;
				break;
			case "fraction":
				result.decimal = part.value;
				break;
			case "currency":
				result.currency = part.value;
				break;
			case "minusSign":
				result.sign = part.value;
				break;
		}
	});

	return {
		currency,
		formatted: formatter.format(numAmount),
		isNegative: numAmount < 0,
		original: numAmount,
		parts: result as FormattedAmount["parts"],
	};
};

/**
 * 常用金额格式化预设
 */
export const amountFormats = {
	// 会计格式 (总是显示2位小数)
	accounting: (amount: number | string, currency: string = "CNY", locale: string = "zh-CN") =>
		formatAmount(amount, {
			currency,
			locale,
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
			signDisplay: "always",
		}),

	// 紧凑格式 (1.2万, 1.3亿)
	compact: (amount: number | string, locale: string = "zh-CN") =>
		formatAmount(amount, {
			compactDisplay: "short",
			locale,
			maximumFractionDigits: 0,
			minimumFractionDigits: 0,
			notation: "compact",
			style: "decimal",
		}),
	// 标准货币格式
	currency: (amount: number | string, currency: string = "CNY", locale: string = "zh-CN") =>
		formatAmount(amount, { currency, locale }),

	// 简写货币格式 (¥123.45)
	currencyShort: (amount: number | string, currency: string = "CNY") =>
		formatAmount(amount, { currency, useGrouping: false }),

	// 整数格式 (无小数)
	integer: (amount: number | string, locale: string = "zh-CN") =>
		formatAmount(amount, {
			locale,
			maximumFractionDigits: 0,
			minimumFractionDigits: 0,
			style: "decimal",
			useGrouping: true,
		}),

	// 无千位分隔符
	noGrouping: (amount: number | string, currency: string = "CNY", locale: string = "zh-CN") =>
		formatAmount(amount, {
			currency,
			locale,
			useGrouping: false,
		}),

	// 无货币符号格式
	number: (amount: number | string, locale: string = "zh-CN") =>
		formatAmount(amount, {
			locale,
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
			style: "decimal",
			useGrouping: true,
		}),

	// 百分比格式
	percent: (amount: number | string, locale: string = "zh-CN") => {
		const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
		const formatter = new Intl.NumberFormat(locale, {
			maximumFractionDigits: 2,
			minimumFractionDigits: 1,
			style: "percent",
		});

		return formatter.format(numAmount / 100);
	},
};

/**
 * 中文特定金额格式化
 */
export const cnAmountFormats = {
	// 中文简写 (1.2万元)
	compact: (amount: number | string): string => {
		const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

		if (Number.isNaN(numAmount)) {
			return "无效金额";
		}

		const absAmount = Math.abs(numAmount);
		const sign = numAmount < 0 ? "-" : "";

		if (absAmount >= 100000000) {
			return `${sign}${(absAmount / 100000000).toFixed(2)}亿元`;
		} else if (absAmount >= 10000) {
			return `${sign}${(absAmount / 10000).toFixed(2)}万元`;
		} else if (absAmount >= 1000) {
			return `${sign}${(absAmount / 1000).toFixed(2)}千元`;
		} else {
			return `${sign}${absAmount}元`;
		}
	},

	// 口语化金额 (一块二毛)
	spoken: (amount: number | string): string => {
		const numAmount = Math.abs(typeof amount === "string" ? parseFloat(amount) : amount);

		if (Number.isNaN(numAmount)) {
			return "无效金额";
		}

		const [integerPart, decimalPart] = numAmount.toFixed(2).split(".");
		let result = "";

		// 整数部分
		if (integerPart !== "0") {
			result += `${integerPart}元`;
		}

		// 小数部分
		if (decimalPart) {
			const jiao = parseInt(decimalPart[0] as string, 10);
			const fen = parseInt(decimalPart[1] as string, 10);

			if (jiao > 0) {
				result += `${(result ? "" : "") + jiao}角`;
			}
			if (fen > 0) {
				result += `${fen}分`;
			}
		}

		if (!result) {
			result = "零元";
		}

		return result;
	},
	// 中文大写金额
	upper: (amount: number | string): string => {
		const numAmount = Math.abs(typeof amount === "string" ? parseFloat(amount) : amount);

		if (Number.isNaN(numAmount)) {
			throw new Error("无效的金额数值");
		}

		if (numAmount > 999999999999.99) {
			throw new Error("金额过大，无法转换");
		}

		const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
		const units = ["", "拾", "佰", "仟"];
		const bigUnits = ["", "万", "亿"];

		const [integerPart, decimalPart] = numAmount.toFixed(2).split(".");
		let result = "";

		// 处理整数部分
		if (integerPart !== "0") {
			const integerStr = integerPart?.padStart(12, "0");
			if (!integerStr) {
				return "无效金额";
			}
			const groups = [
				integerStr?.substring(0, 4), // 亿位
				integerStr?.substring(4, 8), // 万位
				integerStr?.substring(8, 12), // 个位
			];

			groups.forEach((group, groupIndex) => {
				let groupResult = "";
				let zeroFlag = false;

				for (let i = 0; i < group.length; i++) {
					const digit = parseInt(group[i] as string, 10);
					const unit = units[group.length - 1 - i];

					if (digit === 0) {
						zeroFlag = true;
					} else {
						if (zeroFlag) {
							groupResult += "零";
							zeroFlag = false;
						}
						groupResult += digits[digit] + (unit || "");
					}
				}

				if (groupResult) {
					result += groupResult + bigUnits[2 - groupIndex];
				}
			});

			result = result.replace(/零+$/, "");
		} else {
			result = "零";
		}

		result += "元";

		// 处理小数部分
		if (decimalPart) {
			const jiao = parseInt(decimalPart[0] as string, 10);
			const fen = parseInt(decimalPart[1] as string, 10);

			if (jiao === 0 && fen === 0) {
				result += "整";
			} else {
				if (jiao > 0) {
					result += `${digits[jiao]}角`;
				}
				if (fen > 0) {
					if (jiao === 0 && integerPart === "0") {
						result += "零";
					}
					result += `${digits[fen]}分`;
				}
			}
		} else {
			result += "整";
		}

		return result;
	},
};

/**
 * 金额验证和工具函数
 */
export const amountUtils = {
	// 向上取整
	ceil: (amount: number, decimals: number = 2): number => {
		const factor = 10 ** decimals;

		return Math.ceil(amount * factor) / factor;
	},

	// 比较金额
	compare: (a: number | string, b: number | string): number => {
		const numA = amountUtils.toNumber(a);
		const numB = amountUtils.toNumber(b);

		return numA - numB;
	},

	// 向下取整
	floor: (amount: number, decimals: number = 2): number => {
		const factor = 10 ** decimals;

		return Math.floor(amount * factor) / factor;
	},

	// 格式化输入 (用于输入框)
	formatInput: (value: string, decimals: number = 2): string => {
		// 只允许数字、小数点、负号
		const cleaned = value.replace(/[^\d.-]/g, "");

		// 确保只有一个小数点
		const parts = cleaned.split(".");

		if (parts.length > 2) {
			return `${parts[0]}.${parts.slice(1).join("")}`;
		}

		// 限制小数位数
		if (parts[1] && parts[1].length > decimals) {
			return `${parts[0]}.${parts[1].substring(0, decimals)}`;
		}

		return cleaned;
	},
	// 验证金额格式
	isValidAmount: (value: string | number): boolean => {
		const numValue = typeof value === "string" ? parseFloat(value) : value;

		return !Number.isNaN(numValue) && Number.isFinite(numValue);
	},

	// 计算百分比
	percentage: (part: number | string, total: number | string): number => {
		const numPart = amountUtils.toNumber(part);
		const numTotal = amountUtils.toNumber(total);

		if (numTotal === 0) return 0;

		return (numPart / numTotal) * 100;
	},

	// 四舍五入到指定小数位
	round: (amount: number, decimals: number = 2): number => {
		const factor = 10 ** decimals;

		return Math.round(amount * factor) / factor;
	},

	// 转换为数字
	toNumber: (value: string | number): number => {
		if (typeof value === "number") return value;

		// 移除货币符号和千位分隔符
		const cleaned = value.replace(/[^\d.-]/g, "");

		return parseFloat(cleaned);
	},
};
