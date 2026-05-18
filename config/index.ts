import path from "node:path";

import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { UnifiedWebpackPluginV5 } from "weapp-tailwindcss/webpack";

import devConfig from "./dev";
import prodConfig from "./prod";

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<"webpack5">(async (merge) => {
	const baseConfig: UserConfigExport<"webpack5"> = {
		alias: {
			"@": path.resolve(__dirname, "../src"),
		},
		cache: {
			enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
		},
		compiler: {
			prebundle: {
				enable: false,
			},
			type: "webpack5",
		},
		copy: {
			options: {},
			patterns: [],
		},
		date: "2026-2-11",
		defineConstants: {},
		designWidth(input) {
			// 配置 NutUI 375 尺寸
			// @ts-expect-error
			if (input?.file?.replace(/\\+/g, "/").indexOf("@nutui") > -1) {
				return 375;
			}
			// 全局使用 Taro 默认的 750 尺寸
			return 750;
		},
		deviceRatio: {
			375: 2,
			640: 2.34 / 2,
			750: 1,
			828: 1.81 / 2,
		},
		framework: "react",
		h5: {
			miniCssExtractPluginOption: {
				chunkFilename: "css/[name].[chunkhash].css",
				filename: "css/[name].[hash].css",
				ignoreOrder: true,
			},
			output: {
				chunkFilename: "js/[name].[chunkhash:8].js",
				filename: "js/[name].[hash:8].js",
			},
			postcss: {
				autoprefixer: {
					config: {},
					enable: true,
				},
				cssModules: {
					config: {
						generateScopedName: "[name]__[local]___[hash:base64:5]",
						namingPattern: "module", // 转换模式，取值为 global/module
					},
					enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
				},
			},
			publicPath: "/",
			staticDirectory: "static",
			webpackChain(chain) {
				chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
				chain.merge({
					plugin: {
						install: {
							args: [
								{
									cssEntries: [
										// 你 @import "tailwindcss"; 那个文件绝对路径
										path.resolve(__dirname, "../src/app.css"),
									],
									// 这里可以传参数
									rem2rpx: true,
								},
							],
							plugin: UnifiedWebpackPluginV5,
						},
					},
				});
			},
		},
		mini: {
			postcss: {
				cssModules: {
					config: {
						generateScopedName: "[name]__[local]___[hash:base64:5]",
						namingPattern: "module", // 转换模式，取值为 global/module
					},
					enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
				},
				pxtransform: {
					config: {},
					enable: true,
				},
			},
			webpackChain(chain) {
				chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
				chain.merge({
					plugin: {
						install: {
							args: [
								{
									// 这里可以传参数
									appType: "taro",
									cssEntries: [
										// 你 @import "tailwindcss"; 那个文件绝对路径
										path.resolve(__dirname, "../src/app.css"),
									],
									injectAdditionalCssVarScope: true, // 配置此字段为 true 即可
									rem2rpx: true,
								},
							],
							plugin: UnifiedWebpackPluginV5,
						},
					},
				});
			},
		},
		outputRoot: "dist",
		plugins: ["@tarojs/plugin-html", "@tarojs/plugin-http"],
		projectName: "taro-react-starter",
		rn: {
			appName: "taroDemo",
			postcss: {
				cssModules: {
					enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
				},
			},
		},
		sourceRoot: "src",
	};

	process.env.BROWSERSLIST_ENV = process.env.NODE_ENV;

	if (process.env.NODE_ENV === "development") {
		// 本地开发构建配置（不混淆压缩）
		return merge({}, baseConfig, devConfig);
	}
	// 生产构建配置（默认开启压缩混淆等）
	return merge({}, baseConfig, prodConfig);
});
