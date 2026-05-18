import {
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
	// WALLPAPER_BANNER,
} from "@constants/constants";

import { siteConfig } from "@/config";
import type { LIGHT_DARK_MODE, WALLPAPER_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	// 在Swup页面切换时，config-carrier可能不存在，使用默认值
	if (!configCarrier) {
		return Number.parseInt(fallback);
	}
	return Number.parseInt(configCarrier.dataset.hue || fallback);
}

export function getHue(): number {
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(
	theme: LIGHT_DARK_MODE,
	clickCoords?: { x: number; y: number },
) {
	// 获取当前主题状态的完整信息
	const currentIsDark = document.documentElement.classList.contains("dark");
	const currentTheme = document.documentElement.getAttribute("data-theme");

	// 计算目标主题状态
	let targetIsDark = false; // 初始化默认值
	switch (theme) {
		case LIGHT_MODE:
			targetIsDark = false;
			break;
		case DARK_MODE:
			targetIsDark = true;
			break;
		default:
			// 处理默认情况，使用当前主题状态
			targetIsDark = currentIsDark;
			break;
	}

	// 检测是否真的需要主题切换：
	// 1. dark类状态是否改变
	// 2. expressiveCode主题是否需要更新
	const needsThemeChange = currentIsDark !== targetIsDark;
	const expectedTheme = targetIsDark ? "github-dark" : "github-light";
	const needsCodeThemeUpdate = currentTheme !== expectedTheme;

	// 如果既不需要主题切换也不需要代码主题更新，直接返回
	if (!needsThemeChange && !needsCodeThemeUpdate) {
		return;
	}

	// 定义实际执行主题切换的函数
	const performThemeChange = () => {
		// 应用主题变化
		if (needsThemeChange) {
			if (targetIsDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		}

		// Set the theme for Expressive Code based on current mode
		// 只在必要时更新 data-theme 属性以减少重绘
		if (needsCodeThemeUpdate) {
			const expressiveTheme = targetIsDark
				? "github-dark"
				: "github-light";
			document.documentElement.setAttribute(
				"data-theme",
				expressiveTheme,
			);
		}
	};

	// 检查浏览器是否支持 View Transitions API
	if (
		needsThemeChange &&
		document.startViewTransition &&
		!window.matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		// 添加标记类，表示正在使用 View Transitions
		document.documentElement.classList.add(
			"is-theme-transitioning",
			"use-view-transition",
		);

		const isGoingDark = targetIsDark;
		if (isGoingDark) {
			document.documentElement.classList.add("going-dark");
		}

		// 使用 View Transitions API 实现平滑过渡
		const transition = document.startViewTransition(() => {
			performThemeChange();
		});

		// 在 View Transition 就绪后，使用 clip-path 圆形扩张/收缩动画
		transition.ready
			.then(() => {
				const x = clickCoords?.x ?? window.innerWidth / 2;
				const y = clickCoords?.y ?? window.innerHeight / 2;

				const endRadius = Math.hypot(
					Math.max(x, innerWidth - x),
					Math.max(y, innerHeight - y),
				);

				const clipPath = [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`,
				];

				const animation = document.documentElement.animate(
					{
						clipPath: isGoingDark
							? [clipPath[1], clipPath[0]]
							: clipPath,
					},
					{
						duration: 400,
						easing: "ease-in-out",
						pseudoElement: isGoingDark
							? "::view-transition-old(root)"
							: "::view-transition-new(root)",
					},
				);

				animation.onfinish = () => {
					transition.skipTransition();
					cleanupTransitionClasses();
				};
			})
			.catch(() => {
				cleanupTransitionClasses();
			});

		// 在过渡完成后移除标记类
		transition.finished
			.then(() => {
				cleanupTransitionClasses();
			})
			.catch(() => {
				cleanupTransitionClasses();
			});
	} else {
		// 不支持 View Transitions API 或用户偏好减少动画，使用传统方式
		// 只在需要主题切换时添加过渡保护
		if (needsThemeChange) {
			document.documentElement.classList.add("is-theme-transitioning");
		}

		performThemeChange();

		// 使用 requestAnimationFrame 确保在下一帧移除过渡保护类
		if (needsThemeChange) {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove(
					"is-theme-transitioning",
				);
			});
		}
	}

	function cleanupTransitionClasses() {
		document.documentElement.classList.remove(
			"is-theme-transitioning",
			"use-view-transition",
			"going-dark",
		);
	}
}

export function setTheme(
	theme: LIGHT_DARK_MODE,
	clickCoords?: { x: number; y: number },
): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme, clickCoords);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

export function getStoredWallpaperMode(): WALLPAPER_MODE {
	return (
		(localStorage.getItem("wallpaperMode") as WALLPAPER_MODE) ||
		siteConfig.wallpaperMode.defaultMode
	);
}

export function setWallpaperMode(mode: WALLPAPER_MODE): void {
	localStorage.setItem("wallpaperMode", mode);
	// 触发自定义事件通知其他组件壁纸模式已改变
	window.dispatchEvent(
		new CustomEvent("wallpaper-mode-change", { detail: { mode } }),
	);
}
