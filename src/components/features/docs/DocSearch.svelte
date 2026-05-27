<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onDestroy, onMount } from "svelte";

	interface Props {
		docSlug: string;
		placeholder?: string;
	}

	const { docSlug, placeholder = "Search docs..." }: Props = $props();

	let keyword = $state("");
	let result: { url: string; meta: { title: string }; excerpt: string }[] = $state([]);
	let pagefindLoaded = false;
	let initialized = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let isExpanded = $state(false);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let searchUnavailable = $state(false);

	function updatePagefindState() {
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefindMizuki &&
			typeof window.pagefindMizuki.search === "function";
		searchUnavailable = initialized && !pagefindLoaded && import.meta.env.PROD;
		return pagefindLoaded;
	}

	async function ensurePagefind() {
		if (import.meta.env.DEV) {
			initialized = true;
			return false;
		}

		if (updatePagefindState()) {
			initialized = true;
			return true;
		}

		try {
			if (typeof window.loadPagefindMizuki === "function") {
				await window.loadPagefindMizuki();
			}
		} finally {
			initialized = true;
			updatePagefindState();
		}

		return pagefindLoaded;
	}

	onMount(() => {
		const handlePagefindReady = () => {
			initialized = true;
			updatePagefindState();
		};
		const handlePagefindError = () => {
			initialized = true;
			updatePagefindState();
		};

		if (import.meta.env.DEV) {
			initialized = true;
		} else {
			document.addEventListener("pagefindmizukiready", handlePagefindReady);
			document.addEventListener("pagefindmizukiloaderror", handlePagefindError);
			void ensurePagefind();
			setTimeout(() => {
				if (!initialized) {
					void ensurePagefind();
				}
			}, 2000);
		}

		return () => {
			document.removeEventListener("pagefindmizukiready", handlePagefindReady);
			document.removeEventListener("pagefindmizukiloaderror", handlePagefindError);
		};
	});

	async function searchDocs(term: string) {
		if (!term) {
			result = [];
			hasSearched = false;
			return;
		}
		if (!initialized || !pagefindLoaded) {
			await ensurePagefind();
		}
		if (!initialized) {return;}

		try {
			isSearching = true;
			hasSearched = true;
			if (import.meta.env.PROD && pagefindLoaded && window.pagefindMizuki) {
				const response = await window.pagefindMizuki.search(term);
				result = await Promise.all(response.results.map((item) => item.data()));
			} else if (import.meta.env.DEV) {
				result = [
					{
						url: `/docs/${docSlug}/`,
						meta: { title: "Dev mode - search not available" },
						excerpt: "Run <mark>build</mark> then <mark>preview</mark> to test search.",
					},
				];
			} else {
				result = [];
			}
		} catch (error) {
			console.error("Docs search error:", error);
			result = [];
		} finally {
			isSearching = false;
		}
	}

	$effect(() => {
		if (initialized) {
			clearTimeout(debounceTimer);
			if (keyword) {
				debounceTimer = setTimeout(() => searchDocs(keyword), 300);
			} else {
				result = [];
			}
		}
	});

	onDestroy(() => {
		clearTimeout(debounceTimer);
	});
</script>

<div class="docs-search-btn" role="search">
	<Icon icon="material-symbols:search" class="search-icon" />
	<input
		type="text"
		class="docs-search-input"
		placeholder={placeholder}
		bind:value={keyword}
		onfocus={() => {
			isExpanded = true;
			void ensurePagefind();
		}}
		onblur={() => {
			if (!keyword) {isExpanded = false;}
		}}
	/>
	<span class="search-shortcut">Ctrl K</span>
</div>

{#if isExpanded && keyword && (result.length > 0 || isSearching || searchUnavailable || hasSearched)}
	<div class="docs-search-results">
		{#if isSearching}
			<div class="docs-search-no-results">Searching...</div>
		{:else if searchUnavailable}
			<div class="docs-search-no-results">Search index is not available.</div>
		{:else if result.length === 0}
			<div class="docs-search-no-results">No results found.</div>
		{:else}
			{#each result as item}
				<a href={item.url} class="docs-search-result-item">
					<div class="result-title">{item.meta.title}</div>
					<div class="result-excerpt">{@html item.excerpt}</div>
				</a>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.docs-search-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--docs-border);
		border-radius: 8px;
		background-color: var(--docs-bg);
		color: var(--docs-text-50);
		font-size: 0.8125rem;
		cursor: text;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
		width: 100%;
		position: relative;
	}

	.docs-search-btn:hover {
		border-color: var(--docs-text-50);
		background-color: var(--docs-bg-soft);
	}

	.search-icon {
		flex-shrink: 0;
		color: var(--docs-text-50);
		font-size: 1rem;
	}

	.docs-search-input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		color: var(--docs-text-100);
		font-size: 0.8125rem;
		font-family: inherit;
		min-width: 0;
	}

	.docs-search-input::placeholder {
		color: var(--docs-text-25);
	}

	.search-shortcut {
		margin-left: auto;
		padding: 0.125rem 0.375rem;
		border: 1px solid var(--docs-border);
		border-radius: 4px;
		font-size: 0.6875rem;
		color: var(--docs-text-50);
		font-family: inherit;
		flex-shrink: 0;
	}

	.docs-search-results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 50;
		max-height: min(360px, calc(100vh - 10rem));
		overflow-y: auto;
		padding: 0.5rem;
		border: 1px solid var(--docs-border);
		border-radius: 8px;
		background: var(--docs-bg);
		box-shadow: var(--docs-shadow-3);
	}

	.docs-search-result-item {
		display: block;
		padding: 0.625rem 0.75rem;
		border-radius: 6px;
		text-decoration: none;
		transition: background-color 0.15s ease;
	}

	.docs-search-result-item:hover {
		background-color: var(--docs-bg-mute);
	}

	.result-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--docs-text-100);
	}

	.result-excerpt {
		font-size: 0.8125rem;
		color: var(--docs-text-50);
		margin-top: 0.125rem;
	}

	.result-excerpt :global(mark) {
		border-radius: 0.2rem;
		background: color-mix(in oklch, var(--primary) 22%, transparent);
		color: var(--docs-text-100);
	}

	.docs-search-no-results {
		padding: 1.5rem;
		text-align: center;
		color: var(--docs-text-50);
		font-size: 0.875rem;
	}
</style>
