import { WALLPAPER_BANNER } from "../constants/constants";
import type { BackgroundWallpaperConfig, FullscreenWallpaperConfig } from "../types/config";

// 背景壁纸配置
export const backgroundWallpaperConfig: BackgroundWallpaperConfig = {
    // 默认壁纸模式
    defaultMode: WALLPAPER_BANNER,
    // 是否允许用户切换壁纸模式
    switchable: true,
    // 整体布局方案切换按钮显示设置
    showModeSwitch: {
        enable: true,
        // "off" = 不显示 | "mobile" = 仅在移动端显示 | "desktop" = 仅在桌面端显示 | "both" = 在所有设备上显示
        visibility: "desktop"
    },
    // Banner模式配置
    banner: {
        // 支持单张图片或图片数组，当数组长度 > 1 时自动启用轮播
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
            switchable: true,
            interval: 3,
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
            // 渐变遮罩颜色（从下往上）
            colors: [
                { color: "var(--color-bg)", stop: 0.2 },
                { color: "transparent", stop: 0.7 },
            ],
        },
        homeText: {
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
        },
        // PicFlow API支持
        imageApi: {
            enable: false,
            url: "http://domain.com/api2_v2.php?format=text&count=4",
        },
    },
    // 全屏壁纸模式配置
    fullscreen: {
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
            interval: 5,
        },
        zIndex: -1,
        opacity: 0.8,
        blur: 1,
        gradient: {
            enable: true,
            colors: [
                { color: "var(--color-bg)", stop: 0.3 },
                { color: "transparent", stop: 0.8 },
            ],
        },
    },
    // 叠加层壁纸模式配置（小图角落显示）
    overlay: {
        src: "/assets/desktop-banner/1.webp",
        position: "bottom-right", // top-left | top-right | bottom-left | bottom-right
        size: {
            width: 300,
            height: 400,
        },
        opacity: 0.9,
        blur: 0,
        cardOpacity: 0.9,
        borderRadius: "1rem",
        margin: "1rem",
        zIndex: 0,
        shadow: true,
        switchable: {
            opacity: true,
            blur: true,
            cardOpacity: true,
        },
    },
};

export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	src: {
		desktop: [
			"/assets/desktop-banner/1.webp",
			"/assets/desktop-banner/2.webp",
			"/assets/desktop-banner/3.webp",
			"/assets/desktop-banner/4.webp",
		], // 桌面横幅图片
		mobile: [
			"/assets/mobile-banner/1.webp",
			"/assets/mobile-banner/2.webp",
			"/assets/mobile-banner/3.webp",
			"/assets/mobile-banner/4.webp",
		], // 移动横幅图片
	}, // 使用本地横幅图片
	position: "center", // 壁纸位置，等同于 object-position
	carousel: {
		enable: true, // 启用轮播
		interval: 5, // 轮播间隔时间（秒）
	},
	zIndex: -1, // 层级，确保壁纸在背景层
	opacity: 0.8, // 壁纸透明度
	blur: 1, // 背景模糊程度
};