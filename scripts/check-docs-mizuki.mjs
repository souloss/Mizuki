import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = process.env.DOCS_MIZUKI_REPO || "https://github.com/souloss/Docs-Mizuki.git";
const ref = process.env.DOCS_MIZUKI_REF || "master";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "docs-mizuki-check-"));
const cloneDir = join(work, "repo");

function run(command, args) {
	execFileSync(command, args, { stdio: "inherit" });
}

function listFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...listFiles(path));
		} else if (entry.isFile()) {
			files.push(path);
		}
	}
	return files;
}

function normalize(content) {
	return content.replace(/\r\n/g, "\n");
}

function stripFrontmatter(content) {
	const normalized = normalize(content);
	if (!normalized.startsWith("---\n")) return normalized;
	const end = normalized.indexOf("\n---", 4);
	if (end === -1) return normalized;
	return normalized.slice(end + 4).replace(/^\n+/, "");
}

try {
	run("git", ["clone", "--depth", "1", "--branch", ref, repo, cloneDir]);

	const upstream = join(cloneDir, "docs", "notes");
	const local = join(root, "src", "content", "docs", "mizuki");

	if (!existsSync(local) || !statSync(local).isDirectory()) {
		throw new Error(`Local docs folder not found: ${local}`);
	}

	const upstreamFiles = listFiles(upstream).map((path) => relative(upstream, path).replace(/\\/g, "/")).sort();
	const localFiles = listFiles(local).map((path) => relative(local, path).replace(/\\/g, "/")).sort();

	const missing = upstreamFiles.filter((file) => !localFiles.includes(file));
	const extra = localFiles.filter((file) => !upstreamFiles.includes(file));
	const changed = [];

	for (const file of upstreamFiles) {
		if (!localFiles.includes(file)) continue;
		const upstreamContent = stripFrontmatter(readFileSync(join(upstream, file), "utf8"));
		const localContent = stripFrontmatter(readFileSync(join(local, file), "utf8"));
		if (upstreamContent !== localContent) {
			changed.push(file);
		}
	}

	if (missing.length || extra.length || changed.length) {
		console.error("Docs-Mizuki Markdown bodies are not aligned with upstream docs/notes.");
		if (missing.length) console.error(`Missing:\n${missing.map((file) => `  - ${file}`).join("\n")}`);
		if (extra.length) console.error(`Extra:\n${extra.map((file) => `  - ${file}`).join("\n")}`);
		if (changed.length) console.error(`Changed:\n${changed.map((file) => `  - ${file}`).join("\n")}`);
		process.exitCode = 1;
	} else {
		console.log("Docs-Mizuki Markdown bodies are aligned with upstream docs/notes.");
	}
} finally {
	rmSync(work, { recursive: true, force: true });
}
