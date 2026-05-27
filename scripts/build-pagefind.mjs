import { execSync } from "node:child_process";

const site = "dist";

console.log("Building separate Pagefind indexes...\n");

// Default index: all HTML except docs pages (which have class="docs-page")
console.log("1. Building default (main site) index...");
try {
	execSync(
		`npx pagefind --site ${site} --glob "**/*.html" --exclude-selectors ".docs-page" --output-subdir pagefind/default`,
		{ stdio: "inherit" },
	);
	console.log("   Default index built.\n");
} catch (error) {
	console.error("   Failed to build default index:", error);
	process.exit(1);
}

// Mizuki docs index: only docs/mizuki HTML
console.log("2. Building Mizuki docs index...");
try {
	execSync(
		`npx pagefind --site ${site} --glob "docs/mizuki/**/*.html" --output-subdir pagefind/mizuki`,
		{ stdio: "inherit" },
	);
	console.log("   Mizuki docs index built.\n");
} catch (error) {
	console.error("   Failed to build Mizuki docs index:", error);
	process.exit(1);
}

console.log("All Pagefind indexes built successfully.");
