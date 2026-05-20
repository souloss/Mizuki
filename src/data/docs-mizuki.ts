export interface DocsMizukiBadge {
	type: "info" | "warning" | "danger" | "tip" | "new" | "recommended" | "not-recommended" | "v2" | "v3" | "v4" | string;
	text: string;
}

export interface DocsMizukiSidebarItem {
	text: string;
	link?: string;
	prefix?: string;
	icon?: string;
	badge?: DocsMizukiBadge;
	collapsed?: boolean;
	items?: DocsMizukiSidebarItem[];
}

export interface DocsMizukiHomeAction {
	theme: "brand" | "alt";
	text: string;
	link: string;
}

export interface DocsMizukiHomeFeature {
	title: string;
	icon: string;
	details: string;
}

export const docsMizukiHome = {
	name: "Mizuki-Ultra",
	tagline: "Astro Next Theme",
	text: "一个简约&功能丰富的 Astro 博客 主题",
	image: "/favicon.png",
	actions: [
		{ theme: "brand", text: "快速开始 →", link: "/docs/mizuki/guide/intro/" },
		{ theme: "alt", text: "在Github上查看 →", link: "https://github.com/matsuzaka-yuki/Mizuki" },
	],
	features: [
		{ title: "响应式布局", icon: "💻", details: "适配移动设备，PC，平板" },
		{ title: "博客 & 文档", icon: "📖", details: "无论是想写博客，或想写产品文档，或者两者兼顾" },
		{ title: "开箱即用", icon: "🚀", details: "支持零配置即可使用，也支持丰富的自定义配置" },
		{ title: "多语言", icon: "⚖", details: "内置了 中文/英文/日语等语言支持" },
		{ title: "双色主题", icon: "👨‍💻", details: "支持 浅色/深色 主题，包括代码高亮" },
		{ title: "插件", icon: "📦", details: "内置丰富的插件，一站式解决网站一般需求" },
		{ title: "搜索、评论", icon: "🔍", details: "内置Twikoo评论系统,快速接入" },
		{ title: "安全", icon: "🔒", details: "网站完全静态渲染,安全度高,还配备全局多语言动态翻译,可以翻译文章内容" },
		{ title: "Markdown 增强", icon: "📝", details: "支持 Markdown 语法，支持 代码块分组、提示容器、任务列表、数学公式、代码演示等" },
	],
} as const;

export const docsMizukiProject = {
	slug: "mizuki",
	title: docsMizukiHome.name,
	description: docsMizukiHome.text,
	defaultLang: "",
} as const;

export const docsMizukiSidebar = [
	{
		"text": "从这里开始",
		"icon": "ri:book-open-line",
		"prefix": "/guide/",
		"collapsed": false,
		"items": [
			{
				"text": "介绍",
				"link": "intro/",
				"icon": "ri:information-line"
			},
			{
				"text": "快速开始",
				"link": "get-started/",
				"icon": "ri:rocket-line"
			},
			{
				"text": "部署",
				"icon": "ri:book-open-line",
				"prefix": "/guide/",
				"collapsed": true,
				"items": [
					{
						"text": "Vercel",
						"link": "deploy/Vercel/",
						"icon": "ri:vercel-line",
						"badge": {
							"type": "warning",
							"text": "推荐"
						}
					},
					{
						"text": "Netlify",
						"link": "deploy/Netlify/",
						"icon": "ri:cloud-line"
					},
					{
						"text": "GitHub Pages",
						"link": "deploy/Github/",
						"icon": "ri:github-line",
						"badge": {
							"type": "danger",
							"text": "不推荐"
						}
					},
					{
						"text": "Cloudflare Pages",
						"link": "deploy/Cloudflare/",
						"icon": "ri:cloud-line"
					},
					{
						"text": "EdgeOne Pages",
						"link": "deploy/Edge/",
						"icon": "ri:cloud-line",
						"badge": {
							"type": "warning",
							"text": "推荐"
						}
					},
					{
						"text": "服务器部署",
						"link": "deploy/server/",
						"icon": "ri:server-line",
						"badge": {
							"type": "info",
							"text": "入门"
						}
					},
					{
						"text": "Docker部署",
						"link": "deploy/docker/",
						"icon": "ri:ship-line"
					},
					{
						"text": "本地构建",
						"link": "deploy/local/",
						"icon": "ri:computer-line",
						"badge": {
							"type": "info",
							"text": "入门"
						}
					}
				]
			}
		]
	},
	{
		"text": "基础布局",
		"icon": "ri:layout-2-line",
		"prefix": "/Basic-Layout/",
		"collapsed": true,
		"items": [
			{
				"text": "基础配置",
				"link": "site-config/",
				"icon": "ri:settings-3-line"
			},
			{
				"text": "整体布局",
				"icon": "ri:layout-2-line",
				"prefix": "/Basic-Layout/",
				"collapsed": true,
				"items": [
					{
						"text": "横幅配置",
						"link": "layout/banner/",
						"icon": "ri:layout-top-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "全屏布局",
						"link": "layout/fullscreen/",
						"icon": "ri:fullscreen-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "纯色背景配置",
						"link": "layout/hide/",
						"icon": "ri:paint-brush-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					}
				]
			},
			{
				"text": "页脚配置",
				"link": "footer/",
				"icon": "ri:layout-bottom-line"
			},
			{
				"text": "背景壁纸",
				"link": "background-wallpaper/",
				"icon": "ri:image-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "字体配置",
				"link": "font-config/",
				"icon": "ri:font-size-2",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "OG图片",
				"link": "og-images/",
				"icon": "ri:image-add-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "页面自动缩放配置",
				"link": "auto-res-algo/",
				"icon": "ri:fullscreen-exit-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "文章列表布局",
				"link": "post-list-layout/",
				"icon": "ri:list-unordered",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "图片优化",
				"link": "image-optimization/",
				"icon": "ri:image-edit-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "配置模块化",
				"link": "config-modularization/",
				"icon": "ri:folder-settings-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "导航栏配置",
				"link": "navBarConfig/",
				"icon": "ri:menu-line",
				"badge": {
					"type": "info",
					"text": "v2"
				}
			},
			{
				"text": "自定义字体",
				"link": "font/",
				"icon": "ri:font-size-2",
				"badge": {
					"type": "info",
					"text": "v3"
				}
			}
		]
	},
	{
		"text": "文章布局",
		"icon": "ri:file-text-line",
		"prefix": "/Article-layout/",
		"collapsed": true,
		"items": [
			{
				"text": "目录导航配置",
				"link": "toc/",
				"icon": "ri:list-check-2",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "分享组件配置",
				"link": "share/",
				"icon": "ri:share-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "编辑历史",
				"link": "Edit-History/",
				"icon": "ri:history-line"
			},
			{
				"text": "版权信息配置",
				"link": "copyright/",
				"icon": "ri:copyright-line"
			},
			{
				"text": "代码块配置",
				"link": "codeblock/",
				"icon": "ri:code-line",
				"badge": {
					"type": "info",
					"text": "v3"
				}
			},
			{
				"text": "Twikoo评论系统配置",
				"link": "Twikoo/",
				"icon": "ri:message-3-line"
			},
			{
				"text": "Giscus评论系统配置",
				"link": "Giscus/",
				"icon": "ri:message-3-line"
			},
			{
				"text": "Waline评论系统配置",
				"link": "Waline/",
				"icon": "ri:message-3-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "Artalk评论系统配置",
				"link": "Artalk/",
				"icon": "ri:message-3-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "Disqus评论系统配置",
				"link": "Disqus/",
				"icon": "ri:message-3-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "赞赏功能",
				"link": "reward/",
				"icon": "ri:heart-2-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "Live Photo",
				"link": "live-photo/",
				"icon": "ri:image-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "随机文章推荐",
				"link": "random-posts/",
				"icon": "ri:shuffle-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "相关文章",
				"link": "related-posts/",
				"icon": "ri:links-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			}
		]
	},
	{
		"text": "特色组件",
		"icon": "ri:magic-line",
		"prefix": "/Feature/",
		"collapsed": true,
		"items": [
			{
				"text": "音乐播放器配置",
				"link": "MusicPlayer/",
				"icon": "ri:music-2-line"
			},
			{
				"text": "Live2d",
				"link": "pio/",
				"icon": "ri:robot-line"
			},
			{
				"text": "Spine看板娘",
				"link": "spine/",
				"icon": "ri:robot-2-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "樱花飘落特效配置",
				"link": "sakura/",
				"icon": "ri:plant-line"
			},
			{
				"text": "Umami配置",
				"link": "umami-config/",
				"icon": "ri:bar-chart-2-line",
				"badge": {
					"type": "info",
					"text": "v3"
				}
			},
			{
				"text": "显示设置",
				"link": "display-settings/",
				"icon": "ri:settings-4-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "特效配置",
				"link": "effects-config/",
				"icon": "ri:sparkles-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "分享卡片",
				"link": "share-card/",
				"icon": "ri:share-box-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "搜索功能",
				"link": "search/",
				"icon": "ri:search-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "浮动控件与进度条",
				"link": "floating-controls/",
				"icon": "ri:arrow-up-circle-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			}
		]
	},
	{
		"text": "侧边栏布局",
		"icon": "ri:sidebar-unfold-line",
		"prefix": "/Sidepanel/",
		"collapsed": true,
		"items": [
			{
				"text": "基础位置配置",
				"link": "global/",
				"icon": "ri:layout-grid-line",
				"badge": {
					"type": "info",
					"text": "v2"
				}
			},
			{
				"text": "个人资料组件配置",
				"link": "profile/",
				"icon": "ri:user-smile-line"
			},
			{
				"text": "公告组件配置",
				"link": "announcement/",
				"icon": "ri:notification-3-line"
			},
			{
				"text": "分类组件配置",
				"link": "categories/",
				"icon": "ri:folder-open-line"
			},
			{
				"text": "标签组件配置",
				"link": "tag/",
				"icon": "ri:price-tag-3-line"
			},
			{
				"text": "站点统计组件配置",
				"link": "site-stats/",
				"icon": "ri:bar-chart-box-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "日历组件配置",
				"link": "calendar/",
				"icon": "ri:calendar-event-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "广告组件配置",
				"link": "advertisement/",
				"icon": "ri:advertisement-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			}
		]
	},
	{
		"text": "页面配置",
		"icon": "ri:star-line",
		"prefix": "/special/",
		"collapsed": true,
		"items": [
			{
				"text": "关于页面",
				"link": "about/",
				"icon": "ri:information-line"
			},
			{
				"text": "日记/说说页面",
				"link": "talking/",
				"icon": "ri:book-line"
			},
			{
				"text": "归档页面",
				"link": "archive/",
				"icon": "ri:archive-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "友链页面",
				"link": "friends/",
				"icon": "ri:links-line",
				"badge": {
					"type": "info",
					"text": "v3"
				}
			},
			{
				"text": "朋友圈",
				"link": "friends-circle/",
				"icon": "ri:chat-group-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "说说页面",
				"link": "talking/",
				"icon": "ri:chat-3-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "留言板",
				"link": "guestbook/",
				"icon": "ri:sticky-note-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "赞助页面",
				"link": "sponsor/",
				"icon": "ri:heart-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "项目页面",
				"link": "projects/",
				"icon": "ri:code-s-slash-line"
			},
			{
				"text": "时间线页面",
				"link": "timeline/",
				"icon": "ri:time-line"
			},
			{
				"text": "技能页面",
				"link": "skills/",
				"icon": "ri:lightbulb-line"
			},
			{
				"text": "设备页面",
				"link": "devices/",
				"icon": "ri:computer-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "番剧页面",
				"link": "anime/",
				"icon": "ri:tv-line",
				"badge": {
					"type": "info",
					"text": "v4"
				}
			},
			{
				"text": "相册页面",
				"link": "gallery/",
				"icon": "ri:image-line",
				"badge": {
					"type": "info",
					"text": "v2"
				}
			}
		]
	},
	{
		"text": "编写文章",
		"icon": "akar-icons:pencil",
		"prefix": "/press/",
		"collapsed": true,
		"items": [
			{
				"text": "Markdown",
				"icon": "ri:book-2-line",
				"collapsed": true,
				"items": [
					{
						"text": "基础",
						"link": "Markdown/Markdown/",
						"icon": "ri:markdown-line"
					},
					{
						"text": "增强",
						"link": "Markdown/customize/",
						"icon": "ri:markdown-line",
						"badge": {
							"type": "info",
							"text": "v2"
						}
					},
					{
						"text": "图表",
						"link": "Markdown/chart/",
						"icon": "ri:pie-chart-line"
					},
					{
						"text": "PlantUML",
						"link": "PlantUML/",
						"icon": "ri:diagram-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "相对链接",
						"link": "Markdown/relative-links/",
						"icon": "ri:link",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "懒加载图片",
						"link": "Markdown/lazy-images/",
						"icon": "ri:lazy-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					}
				]
			},
			{
				"text": "组织",
				"icon": "ri:folder-settings-line",
				"collapsed": true,
				"items": [
					{
						"text": "文件",
						"link": "file/",
						"icon": "ri:file-text-line"
					},
					{
						"text": "文件夹",
						"link": "folder/",
						"icon": "ri:folder-line",
						"badge": {
							"type": "danger",
							"text": "推荐"
						}
					}
				]
			},
			{
				"text": "文章类型",
				"icon": "ri:file-list-2-line",
				"collapsed": true,
				"items": [
					{
						"text": "系列/专栏",
						"link": "series/",
						"icon": "ri:list-indefinite",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "转载文章",
						"link": "reposts/",
						"icon": "ri:arrow-left-right-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "加密文章",
						"link": "encrypted-posts/",
						"icon": "ri:key-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					}
				]
			},
			{
				"text": "高级",
				"icon": "ri:settings-3-line",
				"collapsed": true,
				"items": [
					{
						"text": "文章加密(可选)",
						"link": "key/",
						"icon": "ri:key-line"
					},
					{
						"text": "版权许可",
						"link": "copyright-license/",
						"icon": "ri:copyright-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "固定链接",
						"link": "permalink/",
						"icon": "ri:link",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "图片语法",
						"link": "image/",
						"icon": "ri:image-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					},
					{
						"text": "随机封面图",
						"link": "random-cover/",
						"icon": "ri-image-add-line",
						"badge": {
							"type": "warning",
							"text": "新"
						}
					}
				]
			},
			{
				"text": "资源嵌入",
				"icon": "ri:video-line",
				"collapsed": true,
				"items": [
					{
						"text": "Bilibili 视频",
						"link": "video/bilibili/",
						"icon": "ri:bilibili-line"
					},
					{
						"text": "Youtube 视频",
						"link": "video/youtube/",
						"icon": "ri:youtube-line"
					}
				]
			}
		]
	},
	{
		"text": "其他",
		"icon": "ri:more-2-line",
		"badge": {
			"type": "warning",
			"text": "新"
		},
		"prefix": "/Other/",
		"collapsed": true,
		"items": [
			{
				"text": "内容分离",
				"link": "separation/",
				"icon": "ri:divide-line"
			},
			{
				"text": "仓库结构",
				"link": "structure/",
				"icon": "ri:folder-chart-line"
			},
			{
				"text": "自动构建",
				"link": "auto/",
				"icon": "ri:git-merge-line"
			},
			{
				"text": "迁移指南",
				"link": "migration/",
				"icon": "ri:arrow-left-right-line"
			},
			{
				"text": "国际化",
				"link": "i18n/",
				"icon": "ri:translate-2",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "朋友圈RSS",
				"link": "update-feeds/",
				"icon": "ri:rss-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "文档系统",
				"link": "docs-system/",
				"icon": "ri:book-open-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "Bug基准",
				"link": "benchmark-bugs/",
				"icon": "ri:bug-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "RSS/Atom订阅",
				"link": "rss-atom/",
				"icon": "ri:rss-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "统计分析配置",
				"link": "analytics/",
				"icon": "ri:bar-chart-2-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "页面过渡动画",
				"link": "swup-transitions/",
				"icon": "ri:exchange-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			},
			{
				"text": "构建脚本",
				"link": "build-scripts/",
				"icon": "ri:terminal-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			}
		]
	},
	{
		"text": "迁移指南",
		"icon": "ri:git-branch-line",
		"prefix": "/transfer/",
		"collapsed": true,
		"items": [
			{
				"text": "Gridea导入",
				"link": "gridea-import/",
				"icon": "ri:download-cloud-line",
				"badge": {
					"type": "info",
					"text": "简单"
				}
			},
			{
				"text": "Halo迁移",
				"link": "halo-to-mizuki/",
				"icon": "ri:exchange-line",
				"badge": {
					"type": "warning",
					"text": "中等"
				}
			},
			{
				"text": "Hexo迁移",
				"link": "hexo-to-mizuki/",
				"icon": "ri:exchange-line",
				"badge": {
					"type": "info",
					"text": "简单"
				}
			},
			{
				"text": "HTML导入",
				"link": "html-import/",
				"icon": "ri:html5-line",
				"badge": {
					"type": "info",
					"text": "简单"
				}
			},
			{
				"text": "Hugo迁移",
				"link": "hugo-to-mizuki/",
				"icon": "ri:exchange-line",
				"badge": {
					"type": "info",
					"text": "简单"
				}
			},
			{
				"text": "Jekyll迁移",
				"link": "jekyll-to-mizuki/",
				"icon": "ri:exchange-line",
				"badge": {
					"type": "warning",
					"text": "中等"
				}
			},
			{
				"text": "Markdown导入",
				"link": "markdown-import/",
				"icon": "ri:markdown-line",
				"badge": {
					"type": "info",
					"text": "简单"
				}
			},
			{
				"text": "Typecho迁移",
				"link": "typecho-to-mizuki/",
				"icon": "ri:exchange-line",
				"badge": {
					"type": "warning",
					"text": "中等"
				}
			},
			{
				"text": "WordPress迁移",
				"link": "wordpress-to-mizuki/",
				"icon": "ri:wordpress-line",
				"badge": {
					"type": "danger",
					"text": "困难"
				}
			},
			{
				"text": "Z-Blog导入",
				"link": "zblog-import/",
				"icon": "ri:download-cloud-line",
				"badge": {
					"type": "danger",
					"text": "困难"
				}
			}
		]
	},
	{
		"text": "API 文档",
		"icon": "ri:code-s-slash-line",
		"prefix": "/API/",
		"collapsed": true,
		"items": [
			{
				"text": "Bangumi API",
				"link": "bangumi/",
				"icon": "ri:film-line"
			},
			{
				"text": "Meting API",
				"link": "metings/",
				"icon": "ri:music-2-line"
			},
			{
				"text": "PicFlow API",
				"link": "picflow/",
				"icon": "ri:image-2-line",
				"badge": {
					"type": "warning",
					"text": "新"
				}
			}
		]
	},
	{
		"text": "常见问题",
		"icon": "ri:question-line",
		"prefix": "/problem/",
		"collapsed": true,
		"items": [
			{
				"text": "提问的艺术",
				"link": "question/",
				"icon": "ri:question-line",
				"badge": {
					"type": "danger",
					"text": "必看"
				}
			},
			{
				"text": "WordPress相关问题",
				"link": "wordpress/",
				"icon": "ri:wordpress-line"
			},
			{
				"text": "Typecho相关问题",
				"link": "type/",
				"icon": "ri:file-code-line"
			},
			{
				"text": "错误排查问题",
				"link": "error/",
				"icon": "ri:bug-line",
				"badge": {
					"type": "warning",
					"text": "常见"
				}
			}
		]
	}
] as const satisfies readonly DocsMizukiSidebarItem[];
