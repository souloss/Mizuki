import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	title: "",
	content: "欢迎来到我的博客！这是一条示例公告",
	closable: true,
	link: {
		enable: true,
		text: "Learn More",
		url: "/about/",
		external: false,
	},
};
