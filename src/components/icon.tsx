import { Text } from "@tarojs/components";

import { cn } from "@/lib/utils";

type IconProps = {
	name: string;
	className?: string;
	onClick?: () => void;
};

export function Icon({ name, className, onClick }: IconProps) {
	const style = cn(`tn-icon-${name}`, className);
	return <Text className={style} onClick={onClick} />;
}
