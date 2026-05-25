import type { SiteConfig } from "../types/config";
import { LinkPreset } from "../types/config";

const SITE_LANG = "zh_CN";

export { SITE_LANG };

export const siteConfig: SiteConfig = {
	title: "Mizuki",
	subtitle: "One demo website",
	siteURL: "https://mizuki.mysqil.com/",
	siteStartDate: "2025-01-01",

	lang: SITE_LANG,

	themeColor: {
		hue: 240,
		fixed: false,
	},

	featurePages: {
		anime: true,
		talking: true,
		friends: true,
		projects: true,
		skills: true,
		timeline: true,
		albums: true,
		devices: true,
		series: true,
		reposts: true,
		guestbook: true,
		sponsor: true,
	},

	navbarTitle: {
		mode: "text-icon",
		text: "MizukiUI",
		icon: "assets/home/home.webp",
		logo: "assets/home/default-logo.webp",
	},

	navbar: {
		stickyNavbar: true,
	},

	pageScaling: {
		enable: true,
		targetWidth: 2000,
	},

	bangumi: {
		userId: "your-bangumi-id",
		fetchOnDev: false,
	},

	bilibili: {
		vmid: "your-bilibili-vmid",
		fetchOnDev: false,
		coverMirror: "",
		useWebp: true,
	},

	anime: {
		mode: "local",
	},

	talkingApiUrl: "",
	talkingShowComment: true,

	postListLayout: {
		defaultMode: "list",
		allowSwitch: true,
		categoryBar: {
			enable: true,
		},
	},

	tagStyle: {
		useNewStyle: false,
	},

	wallpaperMode: {
		defaultMode: "banner",
		showModeSwitchOnMobile: "desktop",
	},

	banner: {
		src: {
			desktop: [
				"/assets/desktop-banner/1.webp",
				"/assets/desktop-banner/2.webp",
				"/assets/desktop-banner/3.webp",
				"/assets/desktop-banner/4.webp",
			],
			mobile: [
				"/assets/mobile-banner/1.webp",
				"/assets/mobile-banner/2.webp",
				"/assets/mobile-banner/3.webp",
				"/assets/mobile-banner/4.webp",
			],
		},

		position: "center",

		carousel: {
			enable: true,
			interval: 3,
		},

		waves: {
			enable: true,
			performanceMode: false,
			mobileDisable: false,
		},

		imageApi: {
			enable: false,
			url: "http://domain.com/api_v2.php?format=text&count=4",
		},

		homeText: {
			enable: true,
			title: "我的小窝",

			subtitle: [
				"没有什么特别的，但有你在就足够了",
				"至今你依然是我的光",
				"你啊，不知不觉间成了我的每一天",
				"和你说话的时候，总觉得每天变得有趣了一点",
				"今天是很普通的一天，但也是有点美好的一天",
			],
			typewriter: {
				enable: true,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 2000,
			},
		},

		credit: {
			enable: false,
			text: "Describe",
			url: "",
		},

		navbar: {
			transparentMode: "semifull",
		},
	},
	toc: {
		enable: true,
		mobileTop: true,
		desktopSidebar: true,
		floating: false,
		depth: 2,
		useJapaneseBadge: false,
	},
	showCoverInContent: true,
	generateOgImages: false,
	favicon: [],

	showLastModified: true,
	sharePoster: true,
	pageProgressBar: {
		enable: true,
		height: 3,
		duration: 6000,
	},

	thirdPartyAnalytics: {
		enable: false,
		clarityId: "",
	},

	card: {
		border: true,
		followTheme: false,
	},
};