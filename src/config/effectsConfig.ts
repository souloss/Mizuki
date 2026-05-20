import type { EffectsConfig } from "../types/config";

// 特效配置
export const effectsConfig: EffectsConfig = {
    // 樱花特效配置
    sakura: {
        enable: false,
        // 是否在设置面板显示开关
        switchable: true,
        // 默认配置
        config: {
            sakuraNum: 21,
            limitTimes: -1,
            size: {
                min: 0.5,
                max: 1.1,
            },
            opacity: {
                min: 0.3,
                max: 0.9,
            },
            speed: {
                horizontal: {
                    min: -1.7,
                    max: -1.2,
                },
                vertical: {
                    min: 1.5,
                    max: 2.2,
                },
                rotation: 0.03,
                fadeSpeed: 0.03,
            },
            zIndex: 100,
        },
    },
    // 可以在此添加更多特效配置
};
