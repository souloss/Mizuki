/**
 * 配置统一导出入口
 *
 * 所有配置的 TypeScript 接口定义在 src/types/config.ts 中。
 * 修改配置结构时，请同步更新对应的接口定义。
 *
 * 使用方式：
 *   import { siteConfig, navBarConfig } from "@/config";
 *   import { siteConfig } from "../config";
 */

// ─── 站点核心 ───────────────────────────────────────────────
export { SITE_LANG, siteConfig } from "./siteConfig";

// ─── 导航栏 ─────────────────────────────────────────────────
export { navBarConfig } from "./navBarConfig";

// ─── 个人资料 ───────────────────────────────────────────────
export { profileConfig } from "./profileConfig";

// ─── 内容与版权 ─────────────────────────────────────────────
export { licenseConfig } from "./licenseConfig";
export { permalinkConfig } from "./permalinkConfig";

// ─── 外观与壁纸 ─────────────────────────────────────────────
export { backgroundWallpaperConfig, fullscreenWallpaperConfig } from "./backgroundWallpaper";
export { effectsConfig, sakuraConfig } from "./effectsConfig";
export { fontConfig } from "./fontConfig";

// ─── 代码块 ─────────────────────────────────────────────────
export { expressiveCodeConfig } from "./expressiveCodeConfig";

// ─── 互动功能 ───────────────────────────────────────────────
export { announcementConfig } from "./announcementConfig";
export { commentConfig } from "./commentConfig";
export { rewardConfig } from "./rewardConfig";
export { shareConfig } from "./shareConfig";

// ─── 多媒体 ─────────────────────────────────────────────────
export { musicPlayerConfig } from "./musicConfig";

// ─── 特效 ───────────────────────────────────────────────────
export { pioConfig } from "./pioConfig";

// ─── 布局 ───────────────────────────────────────────────────
export { sidebarLayoutConfig } from "./sidebarConfig";

// ─── 页脚 ───────────────────────────────────────────────────
export { footerConfig } from "./footerConfig";

// ─── 文章推荐 ───────────────────────────────────────────────
export { randomPostsConfig } from "./randomPostsConfig";
export { relatedPostsConfig } from "./relatedPostsConfig";

// ─── 友链 ───────────────────────────────────────────────────
export { friendsConfig } from "./friendsConfig";

// ─── 赞助 ───────────────────────────────────────────────────
export { sponsorConfig } from "./sponsorConfig";

// ─── 插件 ───────────────────────────────────────────────────
export { markmapConfig } from "./markmapConfig";
export { plantumlConfig } from "./plantumlConfig";

// ─── 兼容别名 ───────────────────────────────────────────────
export { backgroundWallpaperConfig as backgroundWallpaper } from "./backgroundWallpaper";

// ─── Widget 配置聚合 ────────────────────────────────────────
import { announcementConfig } from "./announcementConfig";
import { fullscreenWallpaperConfig } from "./backgroundWallpaper";
import { sakuraConfig } from "./effectsConfig";
import { musicPlayerConfig } from "./musicConfig";
import { pioConfig } from "./pioConfig";
import { profileConfig } from "./profileConfig";
import { randomPostsConfig } from "./randomPostsConfig";
import { relatedPostsConfig } from "./relatedPostsConfig";
import { shareConfig } from "./shareConfig";
import { sidebarLayoutConfig } from "./sidebarConfig";

export const widgetConfigs = {
	profile: profileConfig,
	announcement: announcementConfig,
	music: musicPlayerConfig,
	layout: sidebarLayoutConfig,
	sakura: sakuraConfig,
	fullscreenWallpaper: fullscreenWallpaperConfig,
	pio: pioConfig,
	share: shareConfig,
	relatedPosts: relatedPostsConfig,
	randomPosts: randomPostsConfig,
} as const;