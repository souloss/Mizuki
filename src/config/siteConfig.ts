import type { SiteConfig } from "../types/config";

const SITE_LANG = "zh_CN";

export { SITE_LANG };

export const siteConfig: SiteConfig = {
	title: "Mizuki",
	subtitle: "One demo website",
	siteURL: "https://blog.souloss.com/",
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
		text: "souloss",
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

	// 横幅行为/文案配置（图片资源归 backgroundWallpaperConfig.banner）
	banner: {
		carousel: {
			enable: true,
			interval: 3,
			switchable: true,
		},

		waves: {
			enable: true,
			switchable: true,
			performanceMode: false,
			mobileDisable: false,
		},

		gradient: {
			enable: true,
			switchable: true,
			colors: [
				{ color: "var(--color-bg)", stop: 0.2 },
				{ color: "transparent", stop: 0.7 },
			],
		},

		bannerHomeText: {
			enable: true,
			switchable: true,
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

		// 壁纸模式文案（可选，fallback 到 bannerHomeText）
		wallpaperHomeText: {
			enable: true,
			switchable: true,
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
			enableBlur: true,
			blur: 10,
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

	// 统计分析配置
	analytics: {
		umamiAnalytics: {
			// Umami Website ID，在 Umami 后台获取
			websiteId: "cdbf170a-fddb-4963-92e7-aab575aa26eb",
			// Umami JS 地址，自建的话填自己的地址
			scriptUrl: "https://umami.souloss.cn/script.js",
			// 是否追踪出站链接点击事件，默认 true
			trackOutboundLinks: true,
			// 是否自动收集访客浏览器核心网页指标，默认 false
			collectWebVitals: false,
			// 会话回放配置（可选）
			relpays: {
				enabled: false,
				sampleRate: 0.15,
				maskLevel: "moderate",
				maxDuration: 300000,
			},
		},
	},

	card: {
		border: true,
		followTheme: false,
	},
};
