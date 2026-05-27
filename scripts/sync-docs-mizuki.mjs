import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repo = process.env.DOCS_MIZUKI_REPO || "https://github.com/souloss/Docs-Mizuki.git";
const ref = process.env.DOCS_MIZUKI_REF || "master";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "docs-mizuki-"));
const cloneDir = join(work, "repo");

function run(command, args, options = {}) {
	execFileSync(command, args, {
		stdio: "inherit",
		...options,
	});
}

function ensureInside(target, parent) {
	const resolvedTarget = resolve(target);
	const resolvedParent = resolve(parent);
	if (
		resolvedTarget !== resolvedParent &&
		!resolvedTarget.startsWith(resolvedParent + "\\") &&
		!resolvedTarget.startsWith(resolvedParent + "/")
	) {
		throw new Error(`Refusing to write outside workspace: ${resolvedTarget}`);
	}
	return resolvedTarget;
}

function loadNotesSidebar(notesConfigPath) {
	let source = readFileSync(notesConfigPath, "utf8");
	source = source.replace(/import\s+\{[^}]+\}\s+from\s+['"]vuepress-theme-plume['"];?\s*/g, "");
	source = source.replace(
		/export\s+default\s+defineNotesConfig\s*\(/,
		"globalThis.__notes = defineNotesConfig(",
	);

	const context = {
		defineNoteConfig: (config) => config,
		defineNotesConfig: (config) => config,
		globalThis: {},
	};
	vm.createContext(context);
	vm.runInContext(source, context, { filename: notesConfigPath });

	return context.globalThis.__notes?.notes?.[0]?.sidebar ?? [];
}

function writeGeneratedSidebar(sidebar) {
	const target = join(root, "src", "data", "docs-mizuki.ts");
	mkdirSync(dirname(target), { recursive: true });
	const output = `export interface DocsMizukiBadge {
\ttype: "info" | "warning" | "danger" | "tip" | "new" | "recommended" | "not-recommended" | "v2" | "v3" | "v4" | string;
\ttext: string;
}

export interface DocsMizukiSidebarItem {
\ttext: string;
\tlink?: string;
\tprefix?: string;
\ticon?: string;
\tbadge?: DocsMizukiBadge;
\tcollapsed?: boolean;
\titems?: DocsMizukiSidebarItem[];
}

export interface DocsMizukiHomeAction {
\ttheme: "brand" | "alt";
\ttext: string;
\tlink: string;
}

export interface DocsMizukiHomeFeature {
\ttitle: string;
\ticon: string;
\tdetails: string;
}

export const docsMizukiHome = {
\tname: "Mizuki-Ultra",
\ttagline: "Astro Next Theme",
\ttext: "一个简约&功能丰富的 Astro 博客 主题",
\timage: "/favicon.png",
\tactions: [
\t\t{ theme: "brand", text: "快速开始 →", link: "/docs/mizuki/guide/intro/" },
\t\t{ theme: "alt", text: "在Github上查看 →", link: "https://github.com/souloss/Mizuki" },
\t],
\tfeatures: [
\t\t{ title: "响应式布局", icon: "💻", details: "适配移动设备，PC，平板" },
\t\t{ title: "博客 & 文档", icon: "📖", details: "无论是想写博客，或想写产品文档，或者两者兼顾" },
\t\t{ title: "开箱即用", icon: "🚀", details: "支持零配置即可使用，也支持丰富的自定义配置" },
\t\t{ title: "多语言", icon: "⚖", details: "内置了 中文/英文/日语等语言支持" },
\t\t{ title: "双色主题", icon: "👨‍💻", details: "支持 浅色/深色 主题，包括代码高亮" },
\t\t{ title: "插件", icon: "📦", details: "内置丰富的插件，一站式解决网站一般需求" },
\t\t{ title: "搜索、评论", icon: "🔍", details: "内置Twikoo评论系统,快速接入" },
\t\t{ title: "安全", icon: "🔒", details: "网站完全静态渲染,安全度高,还配备全局多语言动态翻译,可以翻译文章内容" },
\t\t{ title: "Markdown 增强", icon: "📝", details: "支持 Markdown 语法，支持 代码块分组、提示容器、任务列表、数学公式、代码演示等" },
\t],
} as const;

export const docsMizukiProject = {
\tslug: "mizuki",
\ttitle: docsMizukiHome.name,
\tdescription: docsMizukiHome.text,
\tdefaultLang: "",
} as const;

export const docsMizukiSidebar = ${JSON.stringify(sidebar, null, "\t")} as const satisfies readonly DocsMizukiSidebarItem[];
`;
	writeFileSync(target, output, "utf8");
}

try {
	run("git", ["clone", "--depth", "1", "--branch", ref, repo, cloneDir]);

	const notesSource = join(cloneDir, "docs", "notes");
	const notesTarget = ensureInside(join(root, "src", "content", "docs", "mizuki"), root);
	if (!existsSync(notesSource)) {
		throw new Error(`Upstream docs notes folder not found: ${notesSource}`);
	}
	rmSync(notesTarget, { recursive: true, force: true });
	cpSync(notesSource, notesTarget, { recursive: true });

	for (const asset of ["favicon.png", "image.png"]) {
		const source = join(cloneDir, "docs", ".vuepress", "public", asset);
		if (existsSync(source)) {
			copyFileSync(source, join(root, "public", asset));
		}
	}

	const sidebar = loadNotesSidebar(join(cloneDir, "docs", ".vuepress", "notes.ts"));
	writeGeneratedSidebar(sidebar);

	console.log("Docs-Mizuki content, assets, and sidebar metadata synced.");
} finally {
	rmSync(work, { recursive: true, force: true });
}
