export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark",
	SYSTEM_MODE = "system";
export const DEFAULT_THEME = LIGHT_MODE;

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_EXTEND = 30;
export const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 100;

// Category constants
export const UNCATEGORIZED = "uncategorized";

// Wallpaper mode constants
export const WALLPAPER_BANNER = "banner";
export const WALLPAPER_FULLSCREEN = "fullscreen";
export const WALLPAPER_OVERLAY = "overlay";
export const WALLPAPER_NONE = "none";

// ─── 壁纸模式 ────────────────────────────────────────────────
// (已在上方定义 WALLPAPER_BANNER / WALLPAPER_FULLSCREEN / WALLPAPER_OVERLAY / WALLPAPER_NONE)

// ─── 导航栏标题模式 ─────────────────────────────────────────
/** 导航栏标题显示模式：仅文字+图标 */
export const NAVBAR_TITLE_TEXT_ICON = "text-icon";
/** 导航栏标题显示模式：仅 Logo */
export const NAVBAR_TITLE_LOGO = "logo";

// ─── 透明导航栏模式 ─────────────────────────────────────────
/** 导航栏透明模式：半透明 */
export const NAVBAR_TRANSPARENT_SEMI = "semi";
/** 导航栏透明模式：全透明 */
export const NAVBAR_TRANSPARENT_FULL = "full";
/** 导航栏透明模式：半全透明 */
export const NAVBAR_TRANSPARENT_SEMIFULL = "semifull";

// ─── 评论系统 ───────────────────────────────────────────────
/** 不使用评论 */
export const COMMENT_NONE = "none";
/** Twikoo 评论系统 */
export const COMMENT_TWIKOO = "twikoo";
/** Waline 评论系统 */
export const COMMENT_WALINE = "waline";
/** Giscus (GitHub Discussions) 评论 */
export const COMMENT_GISCUS = "giscus";
/** Disqus 评论系统 */
export const COMMENT_DISQUS = "disqus";
/** Artalk 评论系统 */
export const COMMENT_ARTALK = "artalk";

// ─── 音乐播放器 ─────────────────────────────────────────────
/** 音乐播放器模式：使用 Meting API 获取歌单 */
export const MUSIC_MODE_METING = "meting";
/** 音乐播放器模式：使用本地歌单 */
export const MUSIC_MODE_LOCAL = "local";

/** 浮动入口模式：默认样式 */
export const MUSIC_FLOATING_DEFAULT = "default";
/** 浮动入口模式：悬浮按钮 */
export const MUSIC_FLOATING_FAB = "fab";

/** 播放模式：顺序播放 */
export const MUSIC_PLAY_MODE_LIST = "list";
/** 播放模式：单曲循环 */
export const MUSIC_PLAY_MODE_ONE = "one";
/** 播放模式：随机播放 */
export const MUSIC_PLAY_MODE_RANDOM = "random";

// ─── Meting API 参数 ────────────────────────────────────────
/** Meting 服务商：网易云音乐 */
export const METING_SERVER_NETEASE = "netease";
/** Meting 服务商：QQ音乐 */
export const METING_SERVER_TENCENT = "tencent";
/** Meting 服务商：酷狗音乐 */
export const METING_SERVER_KUGOU = "kugou";
/** Meting 服务商：虾米音乐 */
export const METING_SERVER_XIAMI = "xiami";
/** Meting 服务商：百度音乐 */
export const METING_SERVER_BAIDU = "baidu";

/** Meting 资源类型：单曲 */
export const METING_TYPE_SONG = "song";
/** Meting 资源类型：歌单 */
export const METING_TYPE_PLAYLIST = "playlist";
/** Meting 资源类型：专辑 */
export const METING_TYPE_ALBUM = "album";
/** Meting 资源类型：搜索 */
export const METING_TYPE_SEARCH = "search";
/** Meting 资源类型：歌手 */
export const METING_TYPE_ARTIST = "artist";

// ─── Anime 数据源模式 ──────────────────────────────────────
/** Anime 数据源：Bangumi */
export const ANIME_MODE_BANGUMI = "bangumi";
/** Anime 数据源：本地数据 */
export const ANIME_MODE_LOCAL = "local";
/** Anime 数据源：Bilibili */
export const ANIME_MODE_BILIBILI = "bilibili";

// ─── 文章列表布局 ───────────────────────────────────────────
/** 文章列表布局：列表模式 */
export const POST_LAYOUT_LIST = "list";
/** 文章列表布局：网格模式 */
export const POST_LAYOUT_GRID = "grid";

// ─── Pio (Live2D) 模式 ─────────────────────────────────────
/** Pio 模式：静态（不显示） */
export const PIO_MODE_STATIC = "static";
/** Pio 模式：固定位置 */
export const PIO_MODE_FIXED = "fixed";
/** Pio 模式：可拖拽 */
export const PIO_MODE_DRAGGABLE = "draggable";

// ─── 壁纸模式切换可见性 ─────────────────────────────────────
/** 壁纸模式切换：始终隐藏 */
export const MODE_SWITCH_OFF = "off";
/** 壁纸模式切换：仅移动端可见 */
export const MODE_SWITCH_MOBILE = "mobile";
/** 壁纸模式切换：仅桌面端可见 */
export const MODE_SWITCH_DESKTOP = "desktop";
/** 壁纸模式切换：两端可见 */
export const MODE_SWITCH_BOTH = "both";

// ─── Waline 登录模式 ────────────────────────────────────────
/** Waline 登录：启用（可选登录） */
export const WALINE_LOGIN_ENABLE = "enable";
/** Waline 登录：强制登录 */
export const WALINE_LOGIN_FORCE = "force";
/** Waline 登录：禁用登录 */
export const WALINE_LOGIN_DISABLE = "disable";
