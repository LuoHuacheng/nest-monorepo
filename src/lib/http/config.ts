import type { AxiosError, AxiosResponse } from "axios";

import type { RequestConfig } from "./core";

// 错误处理方案：错误类型
enum ErrorShowType {
	SILENT = 0,
	WARN_MESSAGE = 1,
	ERROR_MESSAGE = 2,
	NOTIFICATION = 3,
	REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure<T = any> {
	code: string;
	data?: T;
	msg?: string;
	[key: string]: any;
}
/**
 * 业务错误处理
 */
function bizErrorHandler(error: any) {
	if (error.info) {
		const { errorMessage, showType } = error.info;
		switch (showType) {
			case ErrorShowType.SILENT:
				// do nothing
				break;
			case ErrorShowType.WARN_MESSAGE:
				// TODO
				break;
			case ErrorShowType.ERROR_MESSAGE:
				// TODO
				break;
			case ErrorShowType.NOTIFICATION:
				// TODO
				break;
			case ErrorShowType.REDIRECT:
				// TODO
				break;
			default:
				// TODO
				console.error(errorMessage);
		}
	}
}
/**
 * 请求错误处理
 */
function responseStatusHandler(error: AxiosError) {
	if (error.response) {
		const { status } = error.response as AxiosResponse;
		switch (status) {
			case 401:
				// TODO
				break;
			case 403:
				// TODO
				break;
			case 404:
				// TODO
				break;
			default:
				console.error(`Response status:${status}`);
		}
	} else {
		console.error(error.message);
	}
}

const requestConfig: RequestConfig<ResponseStructure> = {
	errorConfig: {
		// 错误接收及处理
		errorHandler: (error: any, opts) => {
			if (opts?.skipErrorHandler) return;
			// 自定义错误的处理
			if (error.name === "BizError") {
				bizErrorHandler(error);
			} else if (error.name === "AxiosError") {
				// Axios 的错误
				// 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
				responseStatusHandler(error);
			} else if (error.request) {
				// 请求已经成功发起，但没有收到响应
				// error.request 在浏览器中是 XMLHttpRequest 的实例
				// 而在node.js中是 http.ClientRequest 的实例
				// TODO
				console.error("None response! Please retry.");
			} else {
				// 发送请求时出了点问题
				// TODO
				console.error("Request error, please retry");
			}
		},
		// 抛出错误
		errorThrower: (res) => {
			const { data, code, msg, errorCode, errorMessage, showType } = res;
			const error: any = new Error(errorMessage || msg);
			error.name = "BizError";
			error.info = {
				data,
				errorCode: errorCode ?? code,
				errorMessage: errorMessage ?? msg,
				showType,
			};
			throw error; // 抛出自定义的错误,请求方法中的 .catch 部分会捕获
		},
	},
	// 请求拦截器
	requestInterceptors: [
		[
			(config) => {
				// 拦截请求配置，进行个性化处理。
				// TODO
				return { ...config };
			},
			(error: AxiosError) => {
				return Promise.reject(error);
			},
		],
	],
	// 响应拦截器，这里只处理状态码 2xx 的情况
	responseInterceptors: [
		(response) => {
			// 拦截响应数据，进行个性化处理
			const { data } = response;
			if (!data) {
				requestConfig.errorConfig?.errorThrower?.({
					code: "E0001",
					msg: "缺少响应数据",
				});
			}
			if (data.code !== 0) {
				// TODO
				requestConfig.errorConfig?.errorThrower?.(data);
			}
			return response;
		},
	],
};

export default requestConfig;
