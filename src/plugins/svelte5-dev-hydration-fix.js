/**
 * Vite plugin to fix Svelte 5 dev-mode hydration errors.
 *
 * In Vite's dev module system, Svelte 5's lazy `init_operations()` may not
 * initialize DOM operation getters (first_child_getter, next_sibling_getter)
 * before component mount() runs. This causes "Cannot read properties of
 * undefined (reading 'call')" errors for all client:only Svelte components.
 *
 * This plugin injects an inline script that forces init_operations() to run
 * before any astro-island hydration occurs, by importing and calling mount()
 * on a dummy fragment — which triggers the full init_operations() →
 * first_child_getter/next_sibling_getter setup sequence.
 *
 * Production builds are unaffected — they bundle Svelte synchronously.
 */
export default function svelte5DevHydrationFix() {
	const virtualModuleId = "virtual:svelte5-dev-hydration-fix";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "svelte5-dev-hydration-fix",
		enforce: "pre",

		resolveId(id) {
			if (id === virtualModuleId) return resolvedVirtualModuleId;
		},

		load(id) {
			if (id !== resolvedVirtualModuleId) return;
			return `
import { mount, unmount } from "svelte";

const Noop = (anchor, props) => {};

try {
	const frag = document.createDocumentFragment();
	const instance = mount(Noop, { target: frag, props: {} });
	unmount(instance);
} catch {
	// If this fails, the real mount will retry init_operations
}
`;
		},

		transformIndexHtml: {
			enforce: "pre",
			transform(_html, ctx) {
				if (!ctx.server) return;
				return [
					{
						tag: "script",
						attrs: { type: "module" },
						children: `import "virtual:svelte5-dev-hydration-fix";`,
						injectTo: "head-prepend",
					},
				];
			},
		},
	};
}
