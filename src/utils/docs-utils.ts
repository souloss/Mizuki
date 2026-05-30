import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

import type {
	DocHomeAction,
	DocHomeConfig,
	DocHomeFeature,
	DocSidebarSection,
} from "@/types/config";

// ── Types ───────────────────────────────────────────────────────────────

export interface DocNavLink {
	title: string;
	url: string;
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

// ── Icon normalization ───────────────────────────────────────────────────

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
	if (!icon) {
		return undefined;
	}
	if (icon === "material-symbols:cloud-upload-rounded") {
		return "material-symbols:cloud";
	}
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
		if (lower.includes(keyword)) {
			return mapped;
		}
	}
	return ICON_FALLBACK;
}

// ── Badge map ───────────────────────────────────────────────────────────

const badgeStyleMap: Record<string, string> = {
	info: "info",
	warning: "warning",
	danger: "danger",
	tip: "tip",
	new: "info",
	recommended: "tip",
	"not-recommended": "danger",
	v2: "info",
	v3: "info",
	v4: "info",
};

function mapBadge(raw?: {
	type?: string;
	text: string;
}): { type: string; text: string } | undefined {
	if (!raw) {
		return undefined;
	}
	return {
		type: badgeStyleMap[raw.type ?? "info"] ?? "info",
		text: raw.text,
	};
}

// ── Auto sidebar tree building ──────────────────────────────────────────

interface TreeNode {
	title: string;
	order: number;
	icon?: string;
	collapsed?: boolean;
	badge?: { type: string; text: string };
	permalink?: string;
	url?: string;
	children: TreeNode[];
	isIndex: boolean;
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
	return nodes
		.sort((a, b) => a.order - b.order)
		.map((n) => ({ ...n, children: sortTree(n.children) }));
}

function treeToSidebarSections(nodes: TreeNode[]): DocSidebarSection[] {
	return sortTree(nodes).map((node) => {
		const items = node.children.map((child) => treeToSidebarItem(child));
		return {
			name: node.title,
			icon: node.icon,
			badge: node.badge,
			collapsed: node.collapsed,
			items,
		};
	});
}

interface DocSidebarItemCompatible {
	title: string;
	url: string;
	order: number;
	isHomepage: boolean;
	isCurrent: boolean;
	collapsed?: boolean;
	icon?: string;
	badge?: { type: string; text: string };
	children?: DocSidebarItemCompatible[];
}

function treeToSidebarItem(node: TreeNode): DocSidebarItemCompatible {
	const children =
		node.children.length > 0
			? sortTree(node.children).map((child) => treeToSidebarItem(child))
			: undefined;

	const url = node.url ?? "";

	return {
		title: node.title,
		url,
		order: node.order,
		isHomepage: node.isIndex && children === undefined,
		isCurrent: false,
		collapsed: node.collapsed,
		icon: node.icon,
		badge: node.badge,
		children,
	};
}

function buildAutoSidebar(
	entries: { id: string; data: Record<string, any> }[],
	docSlug: string,
): DocSidebarSection[] {
	const root: TreeNode = { title: "", order: 0, children: [], isIndex: false };
	const nodeMap = new Map<string, TreeNode>();

	for (const entry of entries) {
		const relativePath = entry.id;
		const parts = relativePath.split("/");
		const fileName = parts[parts.length - 1];
		const dirParts = parts.slice(1, -1);

		const isIndex = fileName === "_index";

		const fm = entry.data;
		const title = fm.title ?? fileName.replace(/\.(md|mdx)$/, "");
		const order = fm.order ?? 0;
		const icon = normalizeIcon(fm.icon);
		const badge = mapBadge(fm.badge);
		const permalink = fm.permalink;
		const collapsed = fm.collapsed;

		let parentNode = root;
		for (let i = 0; i < dirParts.length; i++) {
			const dir = dirParts[i];
			const key = [docSlug, ...dirParts.slice(0, i + 1)].join("/");
			if (!nodeMap.has(key)) {
				const node: TreeNode = {
					title: dir,
					order: 0,
					children: [],
					isIndex: false,
				};
				nodeMap.set(key, node);
				parentNode.children.push(node);
			}
			parentNode = nodeMap.get(key)!;
		}

		if (isIndex) {
			const fullUrl = permalink ? docUrlFromPermalink(docSlug, permalink) : "";
			parentNode.title = title;
			parentNode.order = order;
			parentNode.icon = icon;
			parentNode.badge = badge;
			parentNode.collapsed = collapsed;
			parentNode.isIndex = true;
			parentNode.permalink = permalink;
			parentNode.url = fullUrl;
		} else {
			const fullUrl = permalink
				? docUrlFromPermalink(docSlug, permalink)
				: docUrlFromPermalink(
						docSlug,
						normalizeSlashPath(stripDocSlugAndLang(entry.id, docSlug)),
					);
			const node: TreeNode = {
				title,
				order,
				icon,
				badge,
				collapsed,
				permalink,
				url: fullUrl,
				children: [],
				isIndex: false,
			};
			parentNode.children.push(node);
		}
	}

	return treeToSidebarSections(root.children);
}

// ── Sidebar data retrieval ──────────────────────────────────────────────

export async function getDocSidebarData(
	docSlug: string,
): Promise<DocSidebarSection[]> {
	const allDocs = await getCollection("docs", ({ id }) =>
		id.startsWith(`${docSlug}/`),
	);
	return buildAutoSidebar(allDocs, docSlug);
}

// ── Mark current page in sidebar ────────────────────────────────────────

export function markCurrentPage(
	sections: DocSidebarSection[],
	currentUrl: string,
): DocSidebarSection[] {
	const normalized = normalizeSlashPath(currentUrl);
	let found = false;

	function markItems(
		items: DocSidebarItemCompatible[],
	): DocSidebarItemCompatible[] {
		return items.map((item) => {
			if (found) {
				return item;
			}
			const isCurrent = normalizeSlashPath(item.url) === normalized;
			if (isCurrent) {
				found = true;
			}
			return {
				...item,
				isCurrent,
				children: item.children ? markItems(item.children) : undefined,
			};
		});
	}

	return sections.map((section) => ({
		...section,
		items: markItems(section.items as DocSidebarItemCompatible[]),
	}));
}

// ── Home page config ───────────────────────────────────────────────────

export async function getDocHomeConfig(
	docSlug: string,
): Promise<DocHomeConfig | undefined> {
	const allDocs = await getCollection("docs", ({ id }) =>
		id.startsWith(`${docSlug}/`),
	);

	const rootIndex = allDocs.find((entry) => {
		const parts = entry.id.split("/");
		return parts.length === 2 && parts[1] === "_index";
	});

	if (!rootIndex) {
		return undefined;
	}

	const fm = rootIndex.data;

	return {
		name: fm.title ?? docSlug,
		tagline: fm.tagline ?? "",
		description: fm.description ?? "",
		image: fm.image,
		actions: (fm.actions as DocHomeAction[] | undefined) ?? [],
		features: (fm.features as DocHomeFeature[] | undefined) ?? [],
	};
}

// ── Project slugs ───────────────────────────────────────────────────────

function inferDocSlugFromId(id: string): string {
	return id.replace(/\\/g, "/").split("/")[0] ?? "";
}

export async function getDocProjectSlugs(): Promise<string[]> {
	const allDocs = await getCollection("docs");
	const slugs = new Set<string>();
	for (const doc of allDocs) {
		const slug = doc.data.docSlug || inferDocSlugFromId(doc.id);
		if (slug) {
			slugs.add(slug);
		}
	}
	return [...slugs];
}

export async function getDocProjectMeta(
	docSlug: string,
): Promise<DocProjectMeta> {
	const allDocs = await getCollection("docs", ({ id }) =>
		id.startsWith(`${docSlug}/`),
	);
	const rootIndex = allDocs.find((entry) => {
		const parts = entry.id.split("/");
		return parts.length === 2 && parts[1] === "_index";
	});

	const title =
		rootIndex?.data.title ?? docSlug.charAt(0).toUpperCase() + docSlug.slice(1);
	const description = rootIndex?.data.description ?? "";
	const defaultLang = await getDocDefaultLang(docSlug);
	const availableLangs = await getDocAvailableLangs(docSlug);

	const pages = allDocs.filter((entry) => {
		const fileName = entry.id.split("/").pop() ?? "";
		return fileName !== "_index";
	});

	const sections = new Set<string>();
	for (const page of allDocs) {
		const parts = page.id.split("/");
		if (parts.length > 2) {
			sections.add(parts[1]);
		}
	}

	return {
		slug: docSlug,
		title,
		description,
		defaultLang,
		availableLangs,
		pageCount: pages.length,
		sections: [...sections],
	};
}

// ── Default lang / available langs ──────────────────────────────────────

export async function getDocDefaultLang(docSlug: string): Promise<string> {
	const pages = await getDocPages(docSlug);
	if (pages.length === 0) {
		return "";
	}

	const langCounts: Record<string, number> = {};
	for (const page of pages) {
		const lang = page.data.lang || "";
		langCounts[lang] = (langCounts[lang] || 0) + 1;
	}

	return Object.entries(langCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";
}

export async function getDocAvailableLangs(docSlug: string): Promise<string[]> {
	const pages = await getDocPages(docSlug);
	const langs = new Set(
		pages.map((page) => page.data.lang || "").filter(Boolean),
	);
	return Array.from(langs);
}

// ── Path utilities ─────────────────────────────────────────────────────

function normalizeSlashPath(path: string): string {
	const normalized = path
		.replace(/\\/g, "/")
		.replace(/\/+/g, "/")
		.toLowerCase();
	if (normalized === "/") {
		return "/";
	}
	return `/${normalized.replace(/^\/+|\/+$/g, "")}/`;
}

function stripExt(path: string): string {
	return path;
}

function stripDocSlugAndLang(
	id: string,
	docSlug: string,
	lang?: string,
): string {
	let path = stripExt(id).replace(/\\/g, "/");
	if (path === docSlug) {
		return "index";
	}
	if (path.startsWith(`${docSlug}/`)) {
		path = path.slice(docSlug.length + 1);
	}
	if (lang && path === lang) {
		return "index";
	}
	if (lang && path.startsWith(`${lang}/`)) {
		path = path.slice(lang.length + 1);
	}
	return path || "index";
}

const DOCS_BASE = "/docs";

function docUrlFromPermalink(
	docSlug: string,
	permalink: string,
	lang?: string,
	defaultLang?: string,
): string {
	const langPart = lang && lang !== (defaultLang || "") ? `/${lang}` : "";
	return normalizeSlashPath(`${DOCS_BASE}/${docSlug}${langPart}${permalink}`);
}

// ── Page URL ────────────────────────────────────────────────────────────

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

// ── Get all pages for a doc slug ────────────────────────────────────────

export async function getDocPages(
	docSlug: string,
): Promise<CollectionEntry<"docs">[]> {
	return getCollection("docs", (entry) => {
		const entryDocSlug = entry.data.docSlug || inferDocSlugFromId(entry.id);
		return entryDocSlug === docSlug;
	});
}

// ── Prev/Next links ────────────────────────────────────────────────────

export async function getDocPrevNextLinks(
	docSlug: string,
	currentPageId: string,
	lang?: string,
	defaultLang?: string,
): Promise<{ prev?: DocNavLink; next?: DocNavLink }> {
	const sections = await getDocSidebarData(docSlug);
	const items: { title: string; url: string }[] = [];

	function flatten(source: DocSidebarItemCompatible[]) {
		for (const item of source) {
			if (item.children?.length) {
				flatten(item.children);
			} else if (item.url) {
				items.push({ title: item.title, url: item.url });
			}
		}
	}

	for (const section of sections) {
		flatten(section.items as DocSidebarItemCompatible[]);
	}

	const currentUrl = getDocPageUrl(docSlug, currentPageId, lang, defaultLang);
	const normalized = normalizeSlashPath(currentUrl);
	const idx = items.findIndex(
		(item) => normalizeSlashPath(item.url) === normalized,
	);

	if (idx === -1) {
		return {};
	}

	return {
		prev:
			idx > 0
				? { title: items[idx - 1].title, url: items[idx - 1].url }
				: undefined,
		next:
			idx < items.length - 1
				? { title: items[idx + 1].title, url: items[idx + 1].url }
				: undefined,
	};
}

// ── Page with fallback ─────────────────────────────────────────────────

export async function getDocPageWithFallback(
	docSlug: string,
	pagePath: string,
	lang: string,
	defaultLang: string,
): Promise<{ entry: CollectionEntry<"docs">; isFallback: boolean }> {
	const requested = await getDocPages(docSlug);
	const match = requested.find(
		(entry) => stripDocSlugAndLang(entry.id, docSlug, lang) === pagePath,
	);
	if (match) {
		return { entry: match, isFallback: false };
	}

	const defaults = await getDocPages(docSlug);
	const fallback = defaults.find(
		(entry) => stripDocSlugAndLang(entry.id, docSlug, defaultLang) === pagePath,
	);
	if (fallback) {
		return { entry: fallback, isFallback: true };
	}

	throw new Error(`Doc page not found: ${docSlug}/${pagePath}`);
}
