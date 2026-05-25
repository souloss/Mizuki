// Patch Vite 7 module-runner transport timeout from 60s to 300s
// This prevents "transport invoke timed out after 60000ms" errors
// when developing large Astro projects with 150+ content entries

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const original = "transport.timeout ?? 6e4";
const patched = "transport.timeout ?? 3e5";

function patchFile(absPath) {
	try {
		let content = readFileSync(absPath, "utf-8");
		if (content.includes(patched)) {
			console.log(`[patch-vite-timeout] Already patched: ${absPath}`);
			return true;
		}
		if (!content.includes(original)) {
			return false;
		}
		content = content.replace(original, patched);
		writeFileSync(absPath, content, "utf-8");
		console.log(`[patch-vite-timeout] Patched: ${absPath} (60s -> 300s)`);
		return true;
	} catch {
		return false;
	}
}

// Find vite in node_modules (works with pnpm's .pnpm structure too)
const nmDir = "node_modules";
let patchedAny = false;

try {
	// Direct node_modules/vite
	const directPath = resolve(nmDir, "vite/dist/node/module-runner.js");
	if (patchFile(directPath)) patchedAny = true;
} catch {}

try {
	// pnpm .pnpm directory
	const pnpmDir = resolve(nmDir, ".pnpm");
	for (const entry of readdirSync(pnpmDir)) {
		if (!entry.startsWith("vite@")) continue;
		const candidate = join(pnpmDir, entry, "node_modules/vite/dist/node/module-runner.js");
		if (patchFile(candidate)) patchedAny = true;
	}
} catch {}

if (!patchedAny) {
	console.log("[patch-vite-timeout] No Vite module-runner.js found to patch");
}
