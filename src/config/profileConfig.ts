import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg",
	name: "松坂雪",
	bio: "世界很大，你必须去看看",
	typewriter: {
		enable: true,
		speed: 80,
	},
	links: [
		{
			name: "Bilibili",
			icon: "fa7-brands:bilibili",
			url: "https://space.bilibili.com/15269273",
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/souloss",
		},
		{
			name: "Codeberg",
			icon: "simple-icons:codeberg",
			url: "https://codeberg.org",
		},
		{
			name: "Discord",
			icon: "fa7-brands:discord",
			url: "https://discord.gg/MqW6TcQtVM",
		},
	],
};