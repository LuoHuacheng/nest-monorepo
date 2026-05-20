import { Button, Form, Input, type FormItemRuleWithoutValidator } from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";

import { Icon } from "@/components/icon";

// import { request } from "@/lib/http";
// import { cn } from "@/lib/utils";

export default function Index() {
	const submitFailed = (error: any) => {
		Taro.showToast({ title: JSON.stringify(error), icon: "error" });
	};

	const submitSucceed = (values: any) => {
		Taro.showToast({ title: JSON.stringify(values), icon: "success" });
	};

	// 函数校验
	const customValidator = (_rule: FormItemRuleWithoutValidator, value: string) => {
		return /^\d+$/.test(value);
	};

	const valueRangeValidator = (_rule: FormItemRuleWithoutValidator, value: string) => {
		return /^(\d{1,2}|1\d{2}|200)$/.test(value);
	};
	return (
		<div className="h-screen p-6">
			<div className="py-20">
				<div className="text-2xl">您好，</div>
				<div className="text-2xl">欢迎来到Taro React Starter</div>
				<div className="mt-2 text-xs text-neutral-700">
					本账号与密码仅用于登录，不存储任何个人信息
				</div>
			</div>
			<Form
				divider
				labelPosition="left"
				onFinish={(values) => submitSucceed(values)}
				onFinishFailed={(_values, errors) => submitFailed(errors)}
				footer={
					<Button nativeType="submit" type="primary" size="large" className="w-full!">
						登录/注册
					</Button>
				}
			>
				<Form.Item
					label={<Icon name="phone" className="text-2xl" />}
					name="phone"
					rules={[{ required: false, message: "请输入手机号" }]}
				>
					<Input placeholder="请输入手机号" type="number" />
				</Form.Item>
				<Form.Item
					label={<Icon name="safe" className="text-2xl" />}
					name="password"
					rules={[
						{ validator: customValidator, message: "必须输入数字" },
						{ validator: valueRangeValidator, message: "必须输入0-200区间" },
					]}
				>
					<Input placeholder="请输入密码" type="text" maxLength={6} />
				</Form.Item>
			</Form>
		</div>
	);
}
