// 说说/动态数据配置
// 用于管理说说/动态页面的数据

export interface TalkingItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

// 示例说说/动态数据
const talkingData: TalkingItem[] = [
	{
		id: 1,
		content:
			"The falling speed of cherry blossoms is five centimeters per second!",
		date: "2025-01-15T10:30:00Z",
		images: ["/images/talking/sakura.jpg", "/images/talking/1.webp"],
	},
];

// 获取说说/动态列表（按时间倒序）
export const getTalkingList = (limit?: number) => {
	const sortedData = [...talkingData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	if (limit && limit > 0) {
		return sortedData.slice(0, limit);
	}

	return sortedData;
};

// 获取所有标签
export const getAllTags = () => {
	const tags = new Set<string>();
	talkingData.forEach((item) => {
		if (item.tags) {
			for (const tag of item.tags) {
				tags.add(tag);
			}
		}
	});
	return Array.from(tags).sort();
};
