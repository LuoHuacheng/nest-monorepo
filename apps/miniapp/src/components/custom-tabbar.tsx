import { Tabbar } from "@nutui/nutui-react-taro";

import HomeActive from "@/assets/icon/home-active.png";
import HomeInactive from "@/assets/icon/home-inactive.png";
import MatchActive from "@/assets/icon/match-active.png";
import MatchInactive from "@/assets/icon/match-inactive.png";
import MineActive from "@/assets/icon/mine-active.png";
import MineInactive from "@/assets/icon/mine-inactive.png";
import PacerActive from "@/assets/icon/pacer-active.png";
import PacerInactive from "@/assets/icon/pacer-inactive.png";
import { tabbarList } from "@/config/constants";
import router from "@/router";

export function CustomTabbar({ activeIndex }: { activeIndex: number }) {
	const onSwitch = (value: number) => {
		router.switchTab({ url: tabbarList[value].pagePath });
	};

	return (
		<Tabbar
			className="pb-safe-area-bottom rounded-t-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.1)]! [&_.nut-tabbar-item]:pt-3!"
			defaultValue={activeIndex}
			fixed
			onSwitch={onSwitch}
			safeArea
			value={activeIndex}
		>
			<Tabbar.Item
				icon={(active) =>
					active ? (
						<img className="size-6" src={HomeActive} />
					) : (
						<img className="size-6" src={HomeInactive} />
					)
				}
				title="首页"
			/>
			<Tabbar.Item
				icon={(active) =>
					active ? (
						<img className="size-6" src={MatchActive} />
					) : (
						<img className="size-6" src={MatchInactive} />
					)
				}
				title="赛事"
			/>
			<Tabbar.Item
				icon={(active) =>
					active ? (
						<img className="size-6" src={PacerActive} />
					) : (
						<img className="size-6" src={PacerInactive} />
					)
				}
				title="配速员"
			/>
			<Tabbar.Item
				icon={(active) =>
					active ? (
						<img className="size-6" src={MineActive} />
					) : (
						<img className="size-6" src={MineInactive} />
					)
				}
				title="我的"
			/>
		</Tabbar>
	);
}
