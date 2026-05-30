import fs from "node:fs";
import path from "node:path";

import { visit } from "unist-util-visit";

const isDev = () => process.env.NODE_ENV !== "production";

/**
 * remark-relative-links: resolve relative markdown file links (e.g. ./1-file.md)
 * to slug-based URLs (e.g. /posts/internet-architecture/slug/)
 *
 * How it works:
 * 1. Get the current file path from vfile
 * 2. When a relative link is found, resolve the target file's absolute path
 * 3. Read the target file's frontmatter to extract the slug field
 * 4. Build the correct URL based on slug and directory structure
 */

// Cache: resolved filePath -> URL mapping
const resolvedCache = new Map();

/**
 * Extract the slug field from YAML frontmatter in markdown content
 */
function extractSlug(content) {
	const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
	if (!match) {
		return null;
	}
	const yaml = match[1];
	const slugMatch = yaml.match(/^slug:\s*(.+)$/m);
	if (!slugMatch) {
		return null;
	}
	return slugMatch[1].trim().replace(/^["']|["']$/g, "");
}

/**
 * Compute URL from file path and slug.
 * Slug only covers the filename part; directory is preserved.
 */
function computeUrl(absolutePath, slug) {
	// Extract the relative path after src/content/posts/
	const postsDir = "src/content/posts/";
	const postsIndex = absolutePath.replace(/\\/g, "/").indexOf(postsDir);
	if (postsIndex < 0) {
		return null;
	}

	const relativePath = absolutePath
		.replace(/\\/g, "/")
		.substring(postsIndex + postsDir.length);
	const lastSlashIndex = relativePath.lastIndexOf("/");
	const dir =
		lastSlashIndex >= 0 ? relativePath.substring(0, lastSlashIndex + 1) : "";

	if (slug) {
		return `/posts/${dir}${slug}/`;
	}

	// No slug: use default path (based on filename without extension)
	const filename =
		lastSlashIndex >= 0
			? relativePath.substring(lastSlashIndex + 1)
			: relativePath;
	const filenameWithoutExt = filename.replace(/\.(md|mdx|markdown)$/i, "");
	return `/posts/${dir}${filenameWithoutExt}/`;
}

/**
 * Resolve a relative link target file to its URL
 */
function resolveLinkTarget(targetPath) {
	if (resolvedCache.has(targetPath)) {
		return resolvedCache.get(targetPath);
	}

	let result = null;
	try {
		if (fs.existsSync(targetPath)) {
			const content = fs.readFileSync(targetPath, "utf-8");
			const slug = extractSlug(content);
			result = computeUrl(targetPath, slug);
		}
	} catch (_e) {
		// File does not exist or cannot be read; return null
	}

	resolvedCache.set(targetPath, result);
	return result;
}

export function remarkRelativeLinks() {
	return (tree, file) => {
		if (isDev()) {
			return;
		}
		const currentFilePath = file.path || file.history?.[0] || "";
		if (!currentFilePath) {
			return;
		}

		const currentDir = path.dirname(currentFilePath);

		visit(tree, "link", (node) => {
			const url = node.url;
			if (!url || typeof url !== "string") {
				return;
			}

			// Only process relative markdown links
			if (!url.startsWith("./") && !url.startsWith("../")) {
				return;
			}

			// Separate anchor from path (e.g. ./file.md#section)
			let anchor = "";
			let linkPath = url;
			const anchorIndex = linkPath.indexOf("#");
			if (anchorIndex >= 0) {
				anchor = linkPath.substring(anchorIndex);
				linkPath = linkPath.substring(0, anchorIndex);
			}

			// Only process links to .md/.mdx files
			if (!/\.(md|mdx|markdown)$/i.test(linkPath)) {
				return;
			}

			// Resolve relative path to absolute path
			const resolvedPath = path.resolve(currentDir, linkPath);

			// Look up the target file's URL
			const targetUrl = resolveLinkTarget(resolvedPath);
			if (targetUrl) {
				node.url = targetUrl + anchor;
			}
		});
	};
}
