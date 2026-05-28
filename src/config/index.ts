/**
 * 配置统一导出入口
 *
 * 所有配置的 TypeScript 接口定义在 src/types/config.ts 中。
 * 修改配置结构时，请同步更新对应的接口定义。
 */

// ─── 站点核心 ───────────────────────────────────────────────
export { SITE_LANG, siteConfig } from "./siteConfig";

// ─── 导航栏 ─────────────────────────────────────────────────
export { navBarConfig } from "./navBarConfig";

// ─── 个人资料 ───────────────────────────────────────────────
export { profileConfig } from "./profileConfig";

// ─── 外观与壁纸 ─────────────────────────────────────────────
export { backgroundWallpaperConfig } from "./backgroundWallpaper";
export { effectsConfig } from "./effectsConfig";
export { fontConfig } from "./fontConfig";

// ─── 代码块 ─────────────────────────────────────────────────
export { expressiveCodeConfig } from "./expressiveCodeConfig";

// ─── 互动功能 ───────────────────────────────────────────────
export { announcementConfig } from "./announcementConfig";
export { commentConfig } from "./commentConfig";
export { shareConfig } from "./shareConfig";

// ─── 多媒体 ─────────────────────────────────────────────────
export { musicPlayerConfig } from "./musicConfig";

// ─── 特效 ───────────────────────────────────────────────────
export { pioConfig } from "./pioConfig";

// ─── 布局 ───────────────────────────────────────────────────
export { sidebarLayoutConfig } from "./sidebarConfig";

// ─── 页脚 ───────────────────────────────────────────────────
export { footerConfig } from "./footerConfig";

// ─── 友链 ───────────────────────────────────────────────────
export { friendsConfig } from "./friendsConfig";

// ─── 文章推荐 ───────────────────────────────────────────────
export { randomPostsConfig } from "./randomPostsConfig";
export { relatedPostsConfig } from "./relatedPostsConfig";

// ─── 版权 ───────────────────────────────────────────────────
export { licenseConfig } from "./licenseConfig";

// ─── 赞助 ───────────────────────────────────────────────────
export { sponsorConfig } from "./sponsorConfig";

// ─── 链接 ───────────────────────────────────────────────────
export { permalinkConfig } from "./permalinkConfig";

// ─── 插件 ───────────────────────────────────────────────────
export { markmapConfig } from "./markmapConfig";
export { plantumlConfig } from "./plantumlConfig";

// ─── 兼容别名 ───────────────────────────────────────────────
export { backgroundWallpaperConfig as backgroundWallpaper } from "./backgroundWallpaper";
import { effectsConfig as _effects } from "./effectsConfig";
/** @deprecated 使用 effectsConfig.sakura 代替 */
export const sakuraConfig = _effects.sakura;

// ─── Widget 配置聚合 ────────────────────────────────────────
import { backgroundWallpaperConfig } from "./backgroundWallpaper";
import { musicPlayerConfig } from "./musicConfig";

export const widgetConfigs = {
	sakura: _effects.sakura,
	fullscreenWallpaper: backgroundWallpaperConfig.fullscreen,
	musicPlayer: musicPlayerConfig,
};