import type { TalkingItem } from "../../../data/talking";

export interface MomentCardProps {
	moment: TalkingItem;
	index: number;
	minutesAgo: string;
	hoursAgo: string;
	daysAgo: string;
}
