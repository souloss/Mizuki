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
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
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
			if (typeof window.loadPagefind === "function") {
				await window.loadPagefind();
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
			document.addEventListener("pagefindready", handlePagefindReady);
			document.addEventListener("pagefindloaderror", handlePagefindError);
			void ensurePagefind();
			setTimeout(() => {
				if (!initialized) {
					void ensurePagefind();
				}
			}, 2000);
		}

		return () => {
			document.removeEventListener("pagefindready", handlePagefindReady);
			document.removeEventListener("pagefindloaderror", handlePagefindError);
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
			if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
				const response = await window.pagefind.search(term, {
					filters: { docSlug: docSlug },
				});
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

<div class="docs-search">
	<div class="docs-search-input-wrapper">
		<Icon icon="material-symbols:search" class="docs-search-icon" />
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
	</div>

	{#if isExpanded && keyword && (result.length > 0 || isSearching || searchUnavailable || hasSearched)}
		<div class="docs-search-results">
			{#if isSearching}
				<div class="docs-search-status">Searching...</div>
			{:else if searchUnavailable}
				<div class="docs-search-status">Search index is not available.</div>
			{:else if result.length === 0}
				<div class="docs-search-status">No results found.</div>
			{:else}
				{#each result as item}
					<a href={item.url} class="docs-search-result-item">
						<div class="docs-search-result-title">{item.meta.title}</div>
						<div class="docs-search-result-excerpt">{@html item.excerpt}</div>
					</a>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.docs-search {
		position: relative;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--line-divider);
		margin-bottom: 0.5rem;
	}

	.docs-search-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 0.5rem;
		background: var(--card-bg);
		border: 1px solid var(--line-divider);
	}

	.docs-search-icon {
		font-size: 1rem;
		color: var(--docs-text-30, var(--text-30));
	}

	.docs-search-input {
		width: 100%;
		font-size: 0.875rem;
		background: transparent;
		border: none;
		outline: none;
		color: var(--docs-text-75, var(--text-75));
	}

	.docs-search-input::placeholder {
		color: var(--docs-text-30, var(--text-30));
	}

	.docs-search-results {
		position: absolute;
		top: calc(100% - 0.25rem);
		left: 0.75rem;
		right: 0.75rem;
		z-index: 30;
		margin-top: 0.5rem;
		max-height: min(360px, calc(100vh - 10rem));
		overflow-y: auto;
		padding: 0.35rem;
		border: 1px solid var(--line-divider);
		border-radius: 0.625rem;
		background: var(--card-bg);
		box-shadow: 0 14px 36px rgba(0, 0, 0, 0.12);
	}

	.docs-search-result-item {
		display: block;
		padding: 0.5rem;
		border-radius: 0.375rem;
		text-decoration: none;
		transition: background 0.2s;
	}

	.docs-search-result-item:hover {
		background: var(--toc-btn-hover);
	}

	.docs-search-result-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--docs-text-75, var(--text-75));
	}

	.docs-search-result-excerpt {
		font-size: 0.75rem;
		color: var(--docs-text-50, var(--text-50));
		margin-top: 0.25rem;
	}

	.docs-search-result-excerpt :global(mark) {
		border-radius: 0.2rem;
		background: color-mix(in oklch, var(--primary) 22%, transparent);
		color: var(--docs-text-90, var(--text-90));
	}

	.docs-search-status {
		padding: 0.55rem 0.65rem;
		font-size: 0.8125rem;
		color: var(--docs-text-50, var(--text-50));
	}
</style>
