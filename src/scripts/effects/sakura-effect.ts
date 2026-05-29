/**
 * Sakura 特效模块
 * 管理樱花飘落特效的初始化
 */

import type { SakuraConfig } from "../../types/config";
import { initSakura, getSakuraStatus, stopSakura } from "../../utils/sakura-manager";

/**
 * Sakura 特效处理器类
 * 负责樱花飘落特效的初始化和状态管理
 */
export class SakuraEffectHandler {
	private initialized = false;
	private config: SakuraConfig | null = null;

	/**
	 * 初始化 Sakura 特效
	 */
	init(widgetConfigs: any): void {
		const sakuraConfig = widgetConfigs?.sakura;
		if (!sakuraConfig || !sakuraConfig.enable) {
			return;
		}

		// 避免重复初始化
		if ((window as any).sakuraInitialized) {
			return;
		}

		this.config = sakuraConfig;
		initSakura(sakuraConfig);
		this.initialized = true;
		(window as any).sakuraInitialized = true;
	}

	/**
	 * 检查是否已初始化
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * 获取配置
	 */
	getConfig(): SakuraConfig | null {
		return this.config;
	}
}

// 创建全局实例
let globalSakuraEffectHandler: SakuraEffectHandler | null = null;

/**
 * 获取全局 Sakura 特效处理器实例
 */
export function getSakuraEffectHandler(): SakuraEffectHandler {
	if (!globalSakuraEffectHandler) {
		globalSakuraEffectHandler = new SakuraEffectHandler();
	}
	return globalSakuraEffectHandler;
}

/**
 * 初始化 Sakura 特效（便捷函数）
 */
export function setupSakura(widgetConfigs: any): void {
	const handler = getSakuraEffectHandler();
	handler.init(widgetConfigs);
}

/**
 * 设置 Sakura 特效初始化的 DOM 监听
 */
export function setupSakuraOnDOMReady(widgetConfigs: any): void {
	const handler = getSakuraEffectHandler();
	// Store raw widgetConfigs so we can access sakura params even when config.enable is false
	const sakuraWidgetConfig = widgetConfigs?.sakura;

	const init = () => {
		handler.init(widgetConfigs);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	// Listen for settings panel toggle events
	window.addEventListener("sakuraToggle", (event) => {
		const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
		const isRunning = getSakuraStatus();
		if (detail.enabled && !isRunning) {
			// Build SakuraConfig from EffectsConfig.sakura: { enable, config: {...} }
			const innerConfig = sakuraWidgetConfig?.config || {};
			const sakuraConfig: SakuraConfig = {
				enable: true,
				sakuraNum: innerConfig.sakuraNum ?? 21,
				limitTimes: innerConfig.limitTimes ?? -1,
				size: innerConfig.size ?? { min: 0.5, max: 1.1 },
				opacity: innerConfig.opacity ?? { min: 0.3, max: 0.9 },
				speed: innerConfig.speed ?? {
					horizontal: { min: -1.7, max: -1.2 },
					vertical: { min: 1.5, max: 2.2 },
					rotation: 0.03,
					fadeSpeed: 0.03,
				},
				zIndex: innerConfig.zIndex ?? 100,
			};
			initSakura(sakuraConfig);
		} else if (!detail.enabled && isRunning) {
			stopSakura();
		}
	});
}
