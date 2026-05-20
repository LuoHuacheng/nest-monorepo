export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
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

export const CURRENCIES: Record<string, CurrencyConfig> = {
  CNY: { code: "CNY", decimalDigits: 2, name: "人民币", symbol: "¥" },
  EUR: { code: "EUR", decimalDigits: 2, name: "欧元", symbol: "€" },
  GBP: { code: "GBP", decimalDigits: 2, name: "英镑", symbol: "£" },
  JPY: { code: "JPY", decimalDigits: 0, name: "日元", symbol: "¥" },
  KRW: { code: "KRW", decimalDigits: 0, name: "韩元", symbol: "₩" },
  USD: { code: "USD", decimalDigits: 2, name: "美元", symbol: "$" },
};

export const formatAmount = (
  amount: number | string,
  options: CurrencyFormatOptions = {},
): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(numAmount)) return "--";

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

  const formatter = new Intl.NumberFormat(locale, {
    compactDisplay,
    currency,
    maximumFractionDigits,
    minimumFractionDigits,
    notation,
    signDisplay: signDisplay as unknown as Intl.NumberFormatOptions["signDisplay"],
    style,
    useGrouping,
  });
  return formatter.format(numAmount);
};

export const formatAmountWithParts = (
  amount: number | string,
  options: CurrencyFormatOptions = {},
): FormattedAmount => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(numAmount)) throw new Error("无效的金额数值");

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
  for (const part of parts) {
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
  }

  return {
    currency,
    formatted: formatter.format(numAmount),
    isNegative: numAmount < 0,
    original: numAmount,
    parts: result as FormattedAmount["parts"],
  };
};

export const amountFormats = {
  accounting: (
    amount: number | string,
    currency: string = "CNY",
    locale: string = "zh-CN",
  ) =>
    formatAmount(amount, {
      currency,
      locale,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      signDisplay: "always",
    }),
  compact: (amount: number | string, locale: string = "zh-CN") =>
    formatAmount(amount, {
      compactDisplay: "short",
      locale,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      notation: "compact",
      style: "decimal",
    }),
  currency: (
    amount: number | string,
    currency: string = "CNY",
    locale: string = "zh-CN",
  ) => formatAmount(amount, { currency, locale }),
  currencyShort: (amount: number | string, currency: string = "CNY") =>
    formatAmount(amount, { currency, useGrouping: false }),
  integer: (amount: number | string, locale: string = "zh-CN") =>
    formatAmount(amount, {
      locale,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: "decimal",
      useGrouping: true,
    }),
  noGrouping: (
    amount: number | string,
    currency: string = "CNY",
    locale: string = "zh-CN",
  ) => formatAmount(amount, { currency, locale, useGrouping: false }),
  number: (amount: number | string, locale: string = "zh-CN") =>
    formatAmount(amount, {
      locale,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "decimal",
      useGrouping: true,
    }),
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

export const cnAmountFormats = {
  compact: (amount: number | string): string => {
    const numAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(numAmount)) return "无效金额";
    const absAmount = Math.abs(numAmount);
    const sign = numAmount < 0 ? "-" : "";
    if (absAmount >= 100000000)
      return `${sign}${(absAmount / 100000000).toFixed(2)}亿元`;
    if (absAmount >= 10000)
      return `${sign}${(absAmount / 10000).toFixed(2)}万元`;
    if (absAmount >= 1000)
      return `${sign}${(absAmount / 1000).toFixed(2)}千元`;
    return `${sign}${absAmount}元`;
  },
  spoken: (amount: number | string): string => {
    const numAmount = Math.abs(
      typeof amount === "string" ? parseFloat(amount) : amount,
    );
    if (Number.isNaN(numAmount)) return "无效金额";
    const [integerPart, decimalPart] = numAmount.toFixed(2).split(".");
    let result = "";
    if (integerPart !== "0") result += `${integerPart}元`;
    if (decimalPart) {
      const jiao = parseInt(decimalPart[0] as string, 10);
      const fen = parseInt(decimalPart[1] as string, 10);
      if (jiao > 0) result += `${jiao}角`;
      if (fen > 0) result += `${fen}分`;
    }
    return result || "零元";
  },
  upper: (amount: number | string): string => {
    const numAmount = Math.abs(
      typeof amount === "string" ? parseFloat(amount) : amount,
    );
    if (Number.isNaN(numAmount)) throw new Error("无效的金额数值");
    if (numAmount > 999999999999.99) throw new Error("金额过大，无法转换");
    const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    const units = ["", "拾", "佰", "仟"];
    const bigUnits = ["", "万", "亿"];
    const [integerPart, decimalPart] = numAmount.toFixed(2).split(".");
    let result = "";
    if (integerPart !== "0") {
      const integerStr = integerPart?.padStart(12, "0");
      if (!integerStr) return "无效金额";
      const groups = [
        integerStr.substring(0, 4),
        integerStr.substring(4, 8),
        integerStr.substring(8, 12),
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
        if (groupResult) result += groupResult + bigUnits[2 - groupIndex];
      });
      result = result.replace(/零+$/, "");
    } else {
      result = "零";
    }
    result += "元";
    if (decimalPart) {
      const jiao = parseInt(decimalPart[0] as string, 10);
      const fen = parseInt(decimalPart[1] as string, 10);
      if (jiao === 0 && fen === 0) {
        result += "整";
      } else {
        if (jiao > 0) result += `${digits[jiao]}角`;
        if (fen > 0) {
          if (jiao === 0 && integerPart === "0") result += "零";
          result += `${digits[fen]}分`;
        }
      }
    } else {
      result += "整";
    }
    return result;
  },
};

export const amountUtils = {
  ceil: (amount: number, decimals: number = 2): number => {
    const factor = 10 ** decimals;
    return Math.ceil(amount * factor) / factor;
  },
  compare: (a: number | string, b: number | string): number => {
    return amountUtils.toNumber(a) - amountUtils.toNumber(b);
  },
  floor: (amount: number, decimals: number = 2): number => {
    const factor = 10 ** decimals;
    return Math.floor(amount * factor) / factor;
  },
  formatInput: (value: string, decimals: number = 2): string => {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return `${parts[0]}.${parts.slice(1).join("")}`;
    if (parts[1] && parts[1].length > decimals)
      return `${parts[0]}.${parts[1].substring(0, decimals)}`;
    return cleaned;
  },
  isValidAmount: (value: string | number): boolean => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return !Number.isNaN(numValue) && Number.isFinite(numValue);
  },
  percentage: (part: number | string, total: number | string): number => {
    const numPart = amountUtils.toNumber(part);
    const numTotal = amountUtils.toNumber(total);
    if (numTotal === 0) return 0;
    return (numPart / numTotal) * 100;
  },
  round: (amount: number, decimals: number = 2): number => {
    const factor = 10 ** decimals;
    return Math.round(amount * factor) / factor;
  },
  toNumber: (value: string | number): number => {
    if (typeof value === "number") return value;
    return parseFloat(value.replace(/[^\d.-]/g, ""));
  },
};
