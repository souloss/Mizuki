// 朋友圈数据配置
// 用于管理朋友圈页面的RSS聚合数据

export interface FriendsCircleItem {
	title: string;
	author: string;
	date: string;
	link: string;
	content: string;
}

export interface FriendsCircleConfig {
	// API 接口请求优先，数据格式保持和 data 一致
	api: string;
	// api 为空则使用 data 静态数据
	data: FriendsCircleItem[];
}

// 朋友圈静态数据
export const friendsCircleData: FriendsCircleConfig = {
	api: "",
	data: [
		{
			title: "Astro 中使用 Lenis 增加鼠标滚动阻尼感",
			author: "韩小韩博客",
			date: "2025-03-06",
			link: "https://www.vvhan.com/article/Lenis-in-Astro",
			content:
				"在移动端触控交互中，惯性滚动带来的丝滑体验已成为标配，但鼠标滚轮受限于机械结构，滚动时难免产生生硬的段落感。如何让传统滚轮操作也能获得如触控板般的阻尼反馈？",
		},
		{
			title: "一组手机和电脑动态壁纸分享",
			author: "韩小韩博客",
			date: "2025-03-05",
			link: "https://www.vvhan.com/article/pc-mobile-video-wallpaper",
			content:
				"本文精选一组电脑及手机动态壁纸，让你的设备秒变沉浸式视觉盛宴。",
		},
		{
			title: "Astro 添加 Twikoo 评论组件",
			author: "韩小韩博客",
			date: "2025-03-03",
			link: "https://www.vvhan.com/article/astro-twikoo",
			content:
				"Astro在使用视图过渡路由时，在跳转路由时，会导致JS文件只有在第一次进入页面时生效，所以Astro在使用视图过渡路由下Twikoo时无法正常使用的。",
		},
	],
};

// 获取朋友圈数据
export function getFriendsCircleList(): FriendsCircleItem[] {
	return friendsCircleData.data;
}