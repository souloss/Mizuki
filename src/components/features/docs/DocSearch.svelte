<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";

	let {
		docSlug,
		variant = "sidebar",
	}: {
		docSlug: string;
		variant?: "sidebar" | "navbar";
	} = $props();

	let isOpen = $state(false);
	let query = $state("");
	let results = $state<SearchResult[]>([]);
	let activeIndex = $state(-1);
	let isLoading = $state(false);
	let searchIndex: PagefindIndex | null = null;
	let initialized = $state(false);
	let searchUnavailable = $state(false);

	interface SearchResult {
		url: string;
		title: string;
		content: string;
		tag?: string;
		sub_results?: { title: string; url: string; content: string }[];
	}

	interface PagefindIndex {
		search: (query: string, options?: { filters?: Record<string, string> }) => Promise<{ results: SearchResult[] }>;
		options: (opts: Record<string, unknown>) => Promise<void>;
	}

	async function loadSearchIndex() {
		if (searchIndex) return true;

		if (import.meta.env.DEV) {
			initialized = true;
			searchUnavailable = true;
			return false;
		}

		// @ts-expect-error Pagefind runtime global
		if (typeof window.pagefindMizuki !== "undefined" && window.pagefindMizuki.search) {
			// @ts-expect-error
			searchIndex = window.pagefindMizuki;
			initialized = true;
			return true;
		}

		// @ts-expect-error
		if (typeof window.loadPagefindMizuki === "function") {
			try {
				// @ts-expect-error
				await window.loadPagefindMizuki();
			} catch {
				// ignore
			}
		}

		// @ts-expect-error
		if (typeof window.pagefindMizuki !== "undefined" && window.pagefindMizuki.search) {
			// @ts-expect-error
			searchIndex = window.pagefindMizuki;
			initialized = true;
			return true;
		}

		initialized = true;
		searchUnavailable = true;
		return false;
	}

	async function doSearch(term: string) {
		if (!term.trim()) {
			results = [];
			return;
		}
		isLoading = true;
		try {
			const loaded = await loadSearchIndex();
			if (!loaded || !searchIndex) {
				results = [];
				return;
			}
			const search = await searchIndex.search(term, {
				filters: { slug: docSlug },
			});
			const items = await Promise.all(
				search.results.slice(0, 15).map(async (r: SearchResult) => {
					if (r.sub_results?.length) return r;
					try {
						const data = await r.data?.();
						return data ?? r;
					} catch {
						return r;
					}
				}),
			);
			results = items;
			activeIndex = -1;
		} finally {
			isLoading = false;
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function onInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		query = val;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => doSearch(val), 200);
	}

	function navigate(index: number) {
		const r = results[index];
		if (!r) return;
		const url = r.sub_results?.[0]?.url ?? r.url;
		window.location.href = url;
		closeModal();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, results.length - 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (e.key === "Enter" && activeIndex >= 0) {
			e.preventDefault();
			navigate(activeIndex);
		} else if (e.key === "Escape") {
			closeModal();
		}
	}

	function openModal() {
		isOpen = true;
		query = "";
		results = [];
		activeIndex = -1;
		document.body.style.overflow = "hidden";
		setTimeout(() => {
			document.getElementById("doc-search-input")?.focus();
		}, 50);
	}

	function closeModal() {
		isOpen = false;
		document.body.style.overflow = "";
	}

	onMount(() => {
		function onKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				if (isOpen) closeModal();
				else openModal();
			}
		}
		document.addEventListener("keydown", onKeydown);
		return () => document.removeEventListener("keydown", onKeydown);
	});

	// Portal: move the overlay to <body> so it's not trapped inside
	// the docs-navbar's containing block (backdrop-filter creates one)
	$effect(() => {
		if (!isOpen) return;
		const overlay = document.querySelector(".doc-search-overlay");
		if (overlay && overlay.parentElement !== document.body) {
			document.body.appendChild(overlay);
		}
	});
</script>

{#if variant === "navbar"}
	<button
		class="doc-search-nav-btn"
		onclick={openModal}
		aria-label={i18n(I18nKey.search)}
		title="{i18n(I18nKey.search)} (⌘K)"
	>
		<Icon icon="material-symbols:search-rounded" width="20" height="20" />
		<span class="doc-search-nav-hint">
			<kbd>⌘</kbd><kbd>K</kbd>
		</span>
	</button>
{:else}
	<button
		class="doc-search-trigger"
		onclick={openModal}
		aria-label={i18n(I18nKey.search)}
	>
		<Icon icon="material-symbols:search-rounded" width="18" height="18" />
		<span>{i18n(I18nKey.search)}</span>
		<kbd class="doc-search-kbd">⌘K</kbd>
	</button>
{/if}

{#if isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="doc-search-overlay"
		onclick={closeModal}
		onkeydown={onKeyDown}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="doc-search-modal" onclick={(e) => e.stopPropagation()}>
			<div class="doc-search-input-row">
				<Icon icon="material-symbols:search-rounded" width="20" height="20" />
				<input
					id="doc-search-input"
					type="text"
					placeholder={i18n(I18nKey.search)}
					value={query}
					oninput={onInput}
					onkeydown={onKeyDown}
				/>
				<button class="doc-search-close-btn" onclick={closeModal} aria-label="Close">
					<kbd>ESC</kbd>
				</button>
			</div>

			{#if isLoading}
				<div class="doc-search-loading">
					<div class="doc-search-spinner"></div>
				</div>
			{/if}

			{#if results.length > 0}
				<ul class="doc-search-results">
					{#each results as result, i}
						<li>
							<button
								class="doc-search-result"
								class:active={i === activeIndex}
								onclick={() => navigate(i)}
								onmouseenter={() => (activeIndex = i)}
							>
								<span class="doc-search-result-title">{result.title}</span>
								{#if result.content}
									<span class="doc-search-result-content">{result.content.slice(0, 120)}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else if query && !isLoading}
				<div class="doc-search-empty">{i18n(I18nKey.noData)}</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* ---------- Navbar trigger button ---------- */
	.doc-search-nav-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.5rem;
		border: 1px solid var(--line-color);
		background: var(--card-bg);
		color: var(--text-75);
		font-size: 0.8125rem;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s;
		white-space: nowrap;
	}
	.doc-search-nav-btn:hover {
		border-color: var(--primary);
		background: var(--btn-plain-bg-hover);
	}
	.doc-search-nav-hint {
		display: inline-flex;
		gap: 0.125rem;
		color: var(--text-30);
		font-size: 0.6875rem;
		line-height: 1;
	}
	.doc-search-nav-hint kbd {
		padding: 0.1rem 0.25rem;
		border-radius: 0.25rem;
		border: 1px solid var(--line-color);
		background: var(--btn-card-bg-hover);
		font-family: inherit;
		font-size: inherit;
	}

	@media (max-width: 768px) {
		.doc-search-nav-btn {
			padding: 0.25rem;
		}
		.doc-search-nav-hint {
			display: none;
		}
	}

	/* ---------- Sidebar trigger button ---------- */
	.doc-search-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--entry-border, var(--line-color));
		border-radius: 0.5rem;
		background: var(--card-bg);
		color: var(--text-50);
		font-size: 0.8125rem;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s;
	}
	.doc-search-trigger:hover {
		border-color: var(--primary);
		background: var(--btn-plain-bg-hover);
	}
	.doc-search-trigger span {
		flex: 1;
		text-align: left;
		color: var(--text-30);
	}
	.doc-search-kbd {
		padding: 0.1rem 0.375rem;
		border-radius: 0.25rem;
		border: 1px solid var(--line-color);
		background: var(--btn-card-bg-hover);
		color: var(--text-30);
		font-family: inherit;
		font-size: 0.6875rem;
	}

	/* ---------- Modal overlay — uses :global to escape containing blocks ---------- */
	:global(.doc-search-overlay) {
		position: fixed !important;
		inset: 0 !important;
		z-index: 9999 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	/* ---------- Modal ---------- */
	:global(.doc-search-modal) {
		width: min(560px, 90vw);
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		border-radius: 0.75rem;
		border: 1px solid var(--line-color);
		background: var(--card-bg);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
	}

	/* ---------- Input row ---------- */
	:global(.doc-search-input-row) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--line-color);
		color: var(--text-50);
	}
	:global(.doc-search-input-row input) {
		flex: 1;
		border: none;
		background: transparent;
		color: var(--text-75);
		font-size: 0.9375rem;
		outline: none;
	}
	:global(.doc-search-input-row input::placeholder) {
		color: var(--text-30);
	}
	:global(.doc-search-close-btn) {
		padding: 0.15rem 0.4rem;
		border-radius: 0.25rem;
		border: 1px solid var(--line-color);
		background: var(--btn-card-bg-hover);
		color: var(--text-30);
		font-size: 0.6875rem;
		cursor: pointer;
	}
	:global(.doc-search-close-btn kbd) {
		font-family: inherit;
	}

	/* ---------- Loading spinner ---------- */
	:global(.doc-search-loading) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}
	:global(.doc-search-spinner) {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid var(--line-color);
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: doc-search-spin 0.6s linear infinite;
	}
	@keyframes doc-search-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ---------- Results list ---------- */
	:global(.doc-search-results) {
		list-style: none;
		margin: 0;
		padding: 0.5rem;
		overflow-y: auto;
	}
	:global(.doc-search-result) {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: var(--text-75);
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}
	:global(.doc-search-result:hover),
	:global(.doc-search-result.active) {
		background: var(--btn-plain-bg-hover);
	}
	:global(.doc-search-result-title) {
		font-weight: 600;
		font-size: 0.875rem;
	}
	:global(.doc-search-result-content) {
		font-size: 0.75rem;
		color: var(--text-30);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	:global(.doc-search-empty) {
		padding: 2rem;
		text-align: center;
		color: var(--text-30);
		font-size: 0.875rem;
	}
</style>