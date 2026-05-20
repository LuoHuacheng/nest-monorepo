// functional-decimal.ts
import Decimal from "decimal.js";

// 配置全局精度（可选）
Decimal.set({ precision: 30 });

// ========== 辅助函数 ==========
const toDecimal = (value: string | number | Decimal): Decimal => {
	return value instanceof Decimal ? value : new Decimal(value);
};

// ========== 数学运算（纯函数） ==========

export const add = (...values: (string | number | Decimal)[]): number => {
	const result = values
		.map(toDecimal)
		.reduce((acc, val) => acc.plus(val), new Decimal(0))
		.toString();
	return Number(result);
};

export const subtract = (
	minuend: string | number | Decimal,
	...subtrahends: (string | number | Decimal)[]
): number => {
	const result = subtrahends
		.reduce((acc, val) => toDecimal(acc).minus(toDecimal(val)), toDecimal(minuend))
		.toString();
	return Number(result);
};

export const multiply = (...values: (string | number | Decimal)[]): number => {
	const result = values
		.map(toDecimal)
		.reduce((acc, val) => acc.times(val), new Decimal(1))
		.toString();
	return Number(result);
};

export const divide = (
	dividend: string | number | Decimal,
	divisor: string | number | Decimal,
): number => Number(toDecimal(dividend).div(toDecimal(divisor)).toString());

export const pow = (base: string | number | Decimal, exponent: string | number | Decimal): number =>
	Number(toDecimal(base).pow(toDecimal(exponent)).toString());

export const modulo = (
	dividend: string | number | Decimal,
	divisor: string | number | Decimal,
): number => Number(toDecimal(dividend).mod(toDecimal(divisor)).toString());

// 比较函数：返回 -1, 0, 1
export const compare = (a: string | number | Decimal, b: string | number | Decimal): number =>
	toDecimal(a).comparedTo(toDecimal(b));

// 是否相等（考虑精度）
export const equals = (a: string | number | Decimal, b: string | number | Decimal): boolean =>
	toDecimal(a).eq(toDecimal(b));
