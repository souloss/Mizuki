// 说说/动态数据配置
// 用于管理说说页面的数据

export interface TalkingItem {
	date: string;
	tags: string[];
	content: string;
	images?: string[];
}

export interface TalkingConfig {
	// API 接口请求优先，数据格式保持和 data 一致
	api: string;
	// api 为空则使用 data 静态数据
	data: TalkingItem[];
}

// 说说静态数据
export const talkingData: TalkingConfig = {
	api: "",
	data: [
		{
			date: "2025-02-12 19:36:16",
			tags: ["生活", "夕阳"],
			content: "好美🌲",
			images: [
				"https://images.unsplash.com/photo-1506744628753-0a4b6b0c7c7e?w=800",
			],
		},
		{
			date: "2024-10-08 18:18:18",
			tags: ["日常", "工作"],
			content: "下班！",
		},
		{
			date: "2024-10-05 16:16:06",
			tags: ["日常"],
			content: "记录第一条说说",
		},
	],
};

// 获取所有说说数据
export function getTalkingList(): TalkingItem[] {
	return talkingData.data;
}

// 获取所有标签
export function getTalkingTags(): string[] {
	return Array.from(new Set(talkingData.data.flatMap((item) => item.tags)));
}