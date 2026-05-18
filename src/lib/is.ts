export function isPhone(phone: string) {
	const regex = /^1[3-9]\d{9}$/;

	return regex.test(phone);
}

export function isVerifyCode(code: string, length: number = 6) {
	const regex = new RegExp(`^\\d{${length}}$`);

	return regex.test(code);
}

export function isUrl(str: string): boolean {
	if (!str || typeof str !== "string") {
		return false;
	}

	// 去除字符串两端的空白字符
	const trimmedStr = str.trim();

	if (trimmedStr === "") {
		return false;
	}

	try {
		// 使用URL构造函数进行验证
		const url = new URL(trimmedStr);

		// 检查协议是否合法（http、https、ftp等）
		const allowedProtocols = ["http:", "https:", "ftp:", "ftps:", "mailto:", "tel:", "sms:"];

		if (!allowedProtocols.includes(url.protocol)) {
			return false;
		}

		// 对于http/https协议，要求有hostname
		if ((url.protocol === "http:" || url.protocol === "https:") && !url.hostname) {
			return false;
		}

		return true;
	} catch {
		// 如果URL构造函数抛出错误，说明不是有效的URL
		return false;
	}
}

export function isEmail(email: string) {
	const regex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;

	return regex.test(email);
}

export function isImageUrl(url: string) {
	return /\.(jpeg|jpg|gif|png|svg|webp|avif|bmp|tiff|heic)$/i.test(url);
}

/**
 * 判断一个值是否为“有效值”
 * 无效值包括：undefined, null, "", [], {}
 */
export function isValidValue(value: unknown): boolean {
	// 排除 null 和 undefined
	if (value == null) return false;

	// 字符串：非空（trim 后）
	if (typeof value === "string") {
		return value.trim() !== "";
	}

	// 数组：非空
	if (Array.isArray(value)) {
		return value.length > 0;
	}

	// 对象（普通对象）：非空（至少有一个自身可枚举属性）
	if (typeof value === "object") {
		// 注意：这里排除了 null（已处理），但需确保是普通对象
		// 防止 Date、RegExp 等被误判为空
		if (Object.getPrototypeOf(value) === Object.prototype) {
			return Object.keys(value).length > 0;
		}
		// 其他对象类型（如 new Date()）视为有效
		return true;
	}

	// number, boolean, symbol, bigint 等原始类型一律视为有效
	return true;
}
