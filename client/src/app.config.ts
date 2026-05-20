import { tabbarList } from "@/config/constants";

export default defineAppConfig({
	pages: [
		"pages/login/index",
		"pages/index/index",
		"pages/match/index",
		"pages/pacer/index",
		"pages/mine/index",
	],
	tabBar: {
		backgroundColor: "#fff",
		color: "#96a0b4",
		custom: true,
		list: tabbarList,
		selectedColor: "#e61e3c",
	},
	window: {
		backgroundColor: "#f5f5fa",
		backgroundTextStyle: "light",
		navigationBarBackgroundColor: "#fff",
		navigationBarTextStyle: "black",
		navigationBarTitleText: "WeChat",
	},
});
