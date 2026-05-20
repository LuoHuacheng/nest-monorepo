// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
module.exports = {
	plugins: [
		[
			"import",
			{
				camel2DashComponentName: false,
				customName: (name, _file) => {
					return `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}`;
				},
				// 自动加载 css 样式文件
				customStyleName: (name) =>
					`@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}/style/css`,
				libraryName: "@nutui/nutui-react-taro",
			},
			"nutui-react",
		],
	],
	presets: [
		[
			"taro",
			{
				compiler: "webpack5",
				framework: "react",
				ts: true,
				useBuiltIns: process.env.TARO_ENV === "h5" ? "usage" : false,
			},
		],
	],
};
