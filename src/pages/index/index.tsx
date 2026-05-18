import { Button } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { CustomTabbar } from "@/components/custom-tabbar";
import { Icon } from "@/components/icon";
import { request } from "@/lib/http";
import { cn } from "@/lib/utils";

const isH5 = process.env.TARO_ENV === "h5";
export default function Index() {
	useLoad(() => {
		console.log("Page loaded.");
		request("/event/list").then((res) => {
			console.log("res", res);
		});
	});

	console.log("isH5", isH5);
	return (
		<View className="h-full pt-10">
			<Text className="rounded-2xl border border-red-500 p-3 text-red-500">Hello world!</Text>
			<Text className={cn(isH5 ? "text-blue-500" : "")}>isH5: {isH5.toString()}</Text>
			<Button type="primary">Click me</Button>
			<Alert variant="destructive">
				<AlertTitle>Payment successful</AlertTitle>
				<AlertDescription>
					Your payment of $29.99 has been processed. A receipt has been sent to your email address.
				</AlertDescription>
			</Alert>
			<Text className="tn-icon-star-square text-2xl text-red-500"></Text>
			<Icon name="starry" className="text-2xl text-red-500" />
			<CustomTabbar activeIndex={0} />
		</View>
	);
}
