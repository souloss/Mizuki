/**
 * Patch Astro's Vite content virtual module to avoid OOM when loading
 * data-store.json during dev server page requests.
 *
 * The original code does JSON.parse() + dataToEsm() which creates TWO
 * copies of the data in memory: (1) the parsed object, (2) the ESM string.
 * By exporting the devalue-stringified content directly, we skip the
 * dataToEsm step and its generated JS string, saving ~1x memory.
 *
 * The runtime (data-store.js) calls devalue.unflatten() on the exported
 * value to reconstruct the Map, so this is compatible.
 *
 * This patch alone is not sufficient for OOM prevention — it only reduces
 * the peak memory by ~1x. The devGlob loader (src/loaders/dev-glob.mjs)
 * does the heavy lifting by reducing data-store.json size at sync time.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FILE = resolve(
	import.meta.dirname,
	"../node_modules/astro/dist/content/vite-plugin-content-virtual-mod.js",
);

let src;
try {
	src = readFileSync(FILE, "utf-8");
} catch {
	console.warn("[patch-data-store-load] File not found, skipping:", FILE);
	process.exit(0);
}

// Already patched — check for our marker
if (src.includes('"export default " + jsonData')) {
	console.log("[patch-data-store-load] Already patched");
	process.exit(0);
}

// Find the target block using regex to handle whitespace variations
const pattern = /const jsonData = await fs\.promises\.readFile\(dataStoreFile, "utf-8"\);\s+try \{\s+const parsed = JSON\.parse\(jsonData\);\s+return \{\s+code: dataToEsm\(parsed, \{\s+compact: true\s+\}\),\s+map: \{ mappings: "" \}\s+\};/;

if (!pattern.test(src)) {
	console.warn("[patch-data-store-load] Could not find target code — Astro may have updated. Skipping.");
	process.exit(1);
}

src = src.replace(pattern, `const jsonData = await fs.promises.readFile(dataStoreFile, "utf-8");
          try {
            return {
              code: "export default " + jsonData,
              map: { mappings: "" }
            };`);

writeFileSync(FILE, src, "utf-8");
console.log("[patch-data-store-load] Patched — data-store.json exported directly as devalue expression (skipping JSON.parse+dataToEsm)");
