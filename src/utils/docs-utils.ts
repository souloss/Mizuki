import { type CollectionEntry,getCollection } from "astro:content";

import { siteConfig } from "@/config";
import type { DocsMizukiSidebarItem } from "@/data/docs-mizuki";
import { docsMizukiHome, docsMizukiProject, docsMizukiSidebar } from "@/data/docs-mizuki";

export interface DocNavLink {
	title: string;
	url: string;
}

export interface DocSidebarItem {
	title: string;
	url: string;
	order: number;
	isHomepage: boolean;
	isCurrent: boolean;
	collapsed?: boolean;
	icon?: string;
	badge?: { type: string; text: string };
	children?: DocSidebarItem[];
}

export interface DocSidebarSection {
	name: string;
	icon?: string;
	badge?: { type: string; text: string };
	collapsed?: boolean;
	items: DocSidebarItem[];
}

export interface DocProjectMeta {
	slug: string;
	title: string;
	description: string;
	defaultLang: string;
	availableLangs: string[];
	pageCount: number;
	sections: string[];
}

const DOCS_BASE = "/docs";

const ICON_FALLBACK = "material-symbols:article-outline-rounded";
const ICON_KEYWORD_MAP: Record<string, string> = {
	announcement: "material-symbols:campaign-rounded",
	api: "material-symbols:api-rounded",
	"bar-chart": "material-symbols:analytics-rounded",
	book: "material-symbols:menu-book-outline-rounded",
	bug: "material-symbols:bug-report-rounded",
	calendar: "material-symbols:calendar-month-rounded",
	cloud: "material-symbols:cloud",
	code: "material-symbols:code-rounded",
	computer: "material-symbols:devices-rounded",
	copyright: "material-symbols:copyright-rounded",
	database: "material-symbols:database",
	download: "material-symbols:cloud-download-rounded",
	exchange: "material-symbols:swap-horiz-rounded",
	file: "material-symbols:article-outline-rounded",
	film: "material-symbols:movie-rounded",
	folder: "material-symbols:folder-rounded",
	fullscreen: "material-symbols:fullscreen-rounded",
	git: "material-symbols:account-tree-rounded",
	github: "mdi:github",
	html: "material-symbols:html-rounded",
	image: "material-symbols:image-rounded",
	information: "material-symbols:info-outline-rounded",
	key: "material-symbols:key-rounded",
	layout: "material-symbols:dashboard-rounded",
	lightbulb: "material-symbols:lightbulb-rounded",
	link: "material-symbols:link-rounded",
	magic: "material-symbols:extension-rounded",
	markdown: "material-symbols:markdown-rounded",
	menu: "material-symbols:menu-rounded",
	message: "material-symbols:chat-rounded",
	music: "material-symbols:music-note-rounded",
	notification: "material-symbols:notifications-rounded",
	pencil: "material-symbols:edit-note-rounded",
	plant: "material-symbols:local-florist-rounded",
	question: "material-symbols:help-outline-rounded",
	rocket: "material-symbols:rocket-launch-rounded",
	server: "material-symbols:dns",
	settings: "material-symbols:settings-rounded",
	share: "material-symbols:share",
	ship: "material-symbols:deployed-code",
	sidebar: "material-symbols:view-sidebar-rounded",
	star: "material-symbols:star-rounded",
	time: "material-symbols:timeline",
	tv: "material-symbols:live-tv-rounded",
	user: "material-symbols:person-rounded",
	video: "material-symbols:smart-display-rounded",
	wordpress: "simple-icons:wordpress",
	youtube: "fa7-brands:youtube",
};

function normalizeIcon(icon?: string): string | undefined {
	if (!icon) {return undefined;}
	if (icon === "material-symbols:cloud-upload-rounded") {return "material-symbols:cloud";}
	if (
		icon.startsWith("material-symbols:") ||
		icon.startsWith("mdi:") ||
		icon.startsWith("fa7-") ||
		icon.startsWith("simple-icons:")
	) {
		return icon;
	}
	const lower = icon.toLowerCase();
	for (const [keyword, mapped] of Object.entries(ICON_KEYWORD_MAP)) {
		if (lower.includes(keyword)) {return mapped;}
	}
	return ICON_FALLBACK;
}

function normalizeSlashPath(path: string): string {
	const normalized = path.replace(/\\/g, "/").replace(/\/+/g, "/");
	if (normalized === "/") {return "/";}
	return `/${normalized.replace(/^\/+|\/+$/g, "")}/`;
}

function joinUrl(...parts: string[]): string {
	return normalizeSlashPath(parts.join("/"));
}

function stripExt(path: string): string {
	return path.replace(/\.(md|mdx)$/i, "");
}

function inferDocSlugFromId(id: string): string {
	return id.replace(/\\/g, "/").split("/")[0] ?? "";
}

function getEntryDocSlug(entry: CollectionEntry<"docs">): string {
	return entry.data.docSlug || inferDocSlugFromId(entry.id);
}

function getEntryLang(entry: CollectionEntry<"docs">): string {
	return entry.data.lang || "";
}

function getEntryTitle(entry: CollectionEntry<"docs">): string {
	if (entry.data.title) {return entry.data.title;}
	const basename = stripExt(entry.id).split("/").pop() || "Untitled";
	return basename
		.split(/[-_]/g)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function stripDocSlugAndLang(id: string, docSlug: string, lang?: string): string {
	let path = stripExt(id).replace(/\\/g, "/");
	if (path === docSlug) {return "index";}
	if (path.startsWith(`${docSlug}/`)) {
		path = path.slice(docSlug.length + 1);
	}
	if (lang && path === lang) {return "index";}
	if (lang && path.startsWith(`${lang}/`)) {
		path = path.slice(lang.length + 1);
	}
	return path || "index";
}

function docUrlFromPermalink(docSlug: string, permalink: string, lang?: string, defaultLang?: string): string {
	const langPart = lang && lang !== (defaultLang || "") ? `/${lang}` : "";
	return normalizeSlashPath(`${DOCS_BASE}/${docSlug}${langPart}${permalink}`);
}

export function getDocPageUrl(
	docSlug: string,
	pageId: string,
	lang?: string,
	defaultLang?: string,
	permalink?: string,
): string {
	const resolvedPermalink = permalink
		? normalizeSlashPath(permalink)
		: (() => {
				const path = stripDocSlugAndLang(pageId, docSlug, lang);
				return path === "index" ? "/" : normalizeSlashPath(path);
			})();
	return docUrlFromPermalink(docSlug, resolvedPermalink, lang, defaultLang);
}

function getDocEntryUrl(entry: CollectionEntry<"docs">, defaultLang?: string): string {
	const docSlug = getEntryDocSlug(entry);
	const lang = getEntryLang(entry);
	return getDocPageUrl(docSlug, entry.id, lang, defaultLang, entry.data.permalink);
}

export async function getDocPages(
	docSlug: string,
	lang?: string,
): Promise<CollectionEntry<"docs">[]> {
	const allDocs = await getCollection("docs", (entry) => getEntryDocSlug(entry) === docSlug);

	if (lang !== undefined) {
		return allDocs.filter((entry) => getEntryLang(entry) === lang);
	}

	return allDocs;
}

export async function getDocProjectSlugs(): Promise<string[]> {
	const allDocs = await getCollection("docs");
	const slugs = new Set(allDocs.map((entry) => getEntryDocSlug(entry)).filter(Boolean));
	return Array.from(slugs).sort((a, b) => {
		if (a === docsMizukiProject.slug) {return -1;}
		if (b === docsMizukiProject.slug) {return 1;}
		return a.localeCompare(b);
	});
}

export async function getDocDefaultLang(docSlug: string): Promise<string> {
	if (docSlug === docsMizukiProject.slug) {return docsMizukiProject.defaultLang;}

	const pages = await getDocPages(docSlug);
	if (pages.length === 0) {return "";}

	const langCounts: Record<string, number> = {};
	for (const page of pages) {
		const lang = getEntryLang(page);
		langCounts[lang] = (langCounts[lang] || 0) + 1;
	}

	return Object.entries(langCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? siteConfig.lang;
}

export async function getDocAvailableLangs(docSlug: string): Promise<string[]> {
	const pages = await getDocPages(docSlug);
	const langs = new Set(pages.map((page) => getEntryLang(page)).filter(Boolean));
	return Array.from(langs);
}

export async function getDocProjectMeta(docSlug: string): Promise<DocProjectMeta> {
	const defaultLang = await getDocDefaultLang(docSlug);
	const availableLangs = await getDocAvailableLangs(docSlug);
	const pages = await getDocPages(docSlug, defaultLang);

	if (docSlug === docsMizukiProject.slug) {
		return {
			slug: docSlug,
			title: docsMizukiProject.title,
			description: docsMizukiProject.description,
			defaultLang,
			availableLangs,
			pageCount: pages.length,
			sections: docsMizukiSidebar.map((section) => section.text),
		};
	}

	const homepage = pages.find((page) => page.data.isHomepage || stripDocSlugAndLang(page.id, docSlug, defaultLang) === "index");
	return {
		slug: docSlug,
		title: homepage ? getEntryTitle(homepage) : docSlug.charAt(0).toUpperCase() + docSlug.slice(1),
		description: homepage?.data.description || "",
		defaultLang,
		availableLangs,
		pageCount: pages.filter((page) => !page.data.isHomepage).length,
		sections: [...new Set(pages.map((page) => page.data.section).filter(Boolean) as string[])],
	};
}

function resolveSidebarItemUrl(
	docSlug: string,
	item: DocsMizukiSidebarItem,
	parentPrefix: string,
): string {
	const prefix = item.prefix ?? parentPrefix;
	const rawLink = item.link ?? "";
	if (!rawLink) {return "";}
	const permalink = rawLink.startsWith("/") ? rawLink : joinUrl(prefix || "/", rawLink);
	return docUrlFromPermalink(docSlug, permalink);
}

function buildMizukiSidebarItems(
	docSlug: string,
	items: readonly DocsMizukiSidebarItem[],
	currentUrl: string,
	parentPrefix: string,
	orderBase: number,
): DocSidebarItem[] {
	return items.map((item, index) => {
		const currentPrefix = item.prefix ?? parentPrefix;
		const children = item.items
			? buildMizukiSidebarItems(docSlug, item.items, currentUrl, currentPrefix, index * 100)
			: undefined;
		const url = resolveSidebarItemUrl(docSlug, item, parentPrefix);
		const isCurrent = url ? normalizeSlashPath(url) === currentUrl : children?.some((child) => child.isCurrent) ?? false;

		return {
			title: item.text,
			url,
			order: orderBase + index,
			isHomepage: false,
			isCurrent,
			collapsed: item.collapsed,
			icon: normalizeIcon(item.icon),
			badge: item.badge,
			children,
		};
	});
}

function buildMizukiSidebar(docSlug: string, currentUrl: string): DocSidebarSection[] {
	return (docsMizukiSidebar as readonly DocsMizukiSidebarItem[]).map((section, index) => {
		const items = buildMizukiSidebarItems(docSlug, section.items ?? [], currentUrl, section.prefix ?? "/", index * 1000);
		const hasCurrent = items.some((item) => item.isCurrent);
		return {
			name: section.text,
			icon: normalizeIcon(section.icon),
			badge: section.badge,
			collapsed: section.collapsed && !hasCurrent,
			items,
		};
	});
}

async function buildFallbackSidebar(
	docSlug: string,
	currentPageId: string,
	lang: string,
	defaultLang: string,
): Promise<DocSidebarSection[]> {
	const pages = (await getDocPages(docSlug, lang)).sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
	const sectionMap = new Map<string, DocSidebarItem[]>();

	for (const page of pages) {
		const section = page.data.section || "";
		const item: DocSidebarItem = {
			title: getEntryTitle(page),
			url: getDocEntryUrl(page, defaultLang),
			order: page.data.order || 0,
			isHomepage: page.data.isHomepage,
			isCurrent: page.id === currentPageId,
			icon: normalizeIcon(page.data.icon),
			badge: page.data.badge,
		};
		if (!sectionMap.has(section)) {sectionMap.set(section, []);}
		sectionMap.get(section)!.push(item);
	}

	return Array.from(sectionMap.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([name, items]) => ({
			name,
			items: items.sort((a, b) => a.order - b.order),
		}));
}

export async function getDocSidebarData(
	docSlug: string,
	currentPageId: string,
	lang?: string,
	defaultLang?: string,
): Promise<DocSidebarSection[]> {
	const resolvedLang = lang || "";
	const resolvedDefaultLang = defaultLang || "";
	const currentEntry = (await getDocPages(docSlug)).find((entry) => entry.id === currentPageId);
	const currentUrl = currentEntry
		? normalizeSlashPath(getDocEntryUrl(currentEntry, resolvedDefaultLang))
		: normalizeSlashPath(`${DOCS_BASE}/${docSlug}/`);

	if (docSlug === docsMizukiProject.slug) {
		return buildMizukiSidebar(docSlug, currentUrl);
	}

	return buildFallbackSidebar(docSlug, currentPageId, resolvedLang, resolvedDefaultLang);
}

export async function getDocPrevNextLinks(
	docSlug: string,
	currentPageId: string,
	lang?: string,
	defaultLang?: string,
): Promise<{ prev?: DocNavLink; next?: DocNavLink }> {
	const sections = await getDocSidebarData(docSlug, currentPageId, lang, defaultLang);
	const items: DocSidebarItem[] = [];

	function flatten(source: DocSidebarItem[]) {
		for (const item of source) {
			if (item.children?.length) {
				flatten(item.children);
			} else if (item.url) {
				items.push(item);
			}
		}
	}

	for (const section of sections) {flatten(section.items);}

	const currentIndex = items.findIndex((item) => item.isCurrent);
	if (currentIndex === -1) {return {};}

	return {
		prev: currentIndex > 0 ? { title: items[currentIndex - 1].title, url: items[currentIndex - 1].url } : undefined,
		next: currentIndex < items.length - 1 ? { title: items[currentIndex + 1].title, url: items[currentIndex + 1].url } : undefined,
	};
}

export async function getDocPageWithFallback(
	docSlug: string,
	pagePath: string,
	lang: string,
	defaultLang: string,
): Promise<{ entry: CollectionEntry<"docs">; isFallback: boolean }> {
	const requested = await getDocPages(docSlug, lang);
	const match = requested.find((entry) => stripDocSlugAndLang(entry.id, docSlug, lang) === pagePath);
	if (match) {return { entry: match, isFallback: false };}

	const defaults = await getDocPages(docSlug, defaultLang);
	const fallback = defaults.find((entry) => stripDocSlugAndLang(entry.id, docSlug, defaultLang) === pagePath);
	if (fallback) {return { entry: fallback, isFallback: true };}

	throw new Error(`Doc page not found: ${docSlug}/${pagePath}`);
}

export { docsMizukiHome };
