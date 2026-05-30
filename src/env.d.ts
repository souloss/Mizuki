/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

// Type declaration for glob-dev-trim.mjs loader
declare module "*/loaders/glob-dev-trim.mjs" {
	export function devGlob(options: { pattern: string; base: string }): {
		name: string;
		load: (context: unknown) => Promise<void>;
	};
}
