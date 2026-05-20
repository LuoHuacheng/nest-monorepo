import { create as createCva, type VariantProps } from "@weapp-tailwindcss/cva";
import { create as createMerge } from "@weapp-tailwindcss/merge";
import { type ClassValue, clsx } from "clsx";

// 跨平台框架请自行判断是否为 H5 构建，通常可从环境变量读取。
const isH5 = process.env.TARO_ENV === "h5";

const { cva } = createCva({
	escape: !isH5,
	unescape: !isH5,
});
export { cva, type VariantProps };

const { twMerge } = createMerge({
	escape: !isH5,
	unescape: !isH5,
});
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function sleep(ms: number = 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
