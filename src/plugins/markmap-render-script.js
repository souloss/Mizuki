(() => {
	if (window.markmapInitialized) {
		return;
	}
	window.markmapInitialized = true;

	let isRendering = false;
	let pendingTheme = null;
	let currentTheme = null;
	let retryCount = 0;
	const MAX_RETRIES = 3;
	const RETRY_DELAY = 1000;
	let renderObserver = null;

	const markmapInstances = new Map();
	const renderedElements = new WeakSet();

	// Dual cache: element -> { light: svgHtml|null, dark: svgHtml|null }
	const cacheStore = new WeakMap();

	function getCache(element) {
		if (!cacheStore.has(element)) {
			cacheStore.set(element, { light: null, dark: null });
		}
		return cacheStore.get(element);
	}

	function getDarkColorFn() {
		const colors = [
			"#e0e0e0",
			"#b0b0b0",
			"#90caf9",
			"#ce93d8",
			"#80cbc4",
			"#fff59d",
			"#ef9a9a",
			"#a5d6a7",
			"#90a4ae",
			"#f48fb1",
		];
		return (node) => {
			const path = node.state?.path || "1";
			const idx = path.split(".").length % colors.length;
			return colors[idx];
		};
	}

	function _waitForMarkmap(timeout = 15000) {
		return new Promise((resolve, reject) => {
			const startTime = Date.now();
			function check() {
				if (window.markmap?.Transformer && window.markmap.Markmap) {
					resolve(window.markmap);
				} else if (Date.now() - startTime > timeout) {
					reject(new Error("Markmap library failed to load within timeout"));
				} else {
					setTimeout(check, 100);
				}
			}
			check();
		});
	}

	async function loadMarkmap() {
		if (window.markmap?.Transformer && window.markmap.Markmap) {
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			const d3Script = document.createElement("script");
			d3Script.src = "https://cdn.jsdelivr.net/npm/d3@7";
			d3Script.onload = () => {
				const libScript = document.createElement("script");
				libScript.src = "https://cdn.jsdelivr.net/npm/markmap-lib@0.16";
				libScript.onload = () => {
					const viewScript = document.createElement("script");
					viewScript.src = "https://cdn.jsdelivr.net/npm/markmap-view@0.16";
					viewScript.onload = () => resolve();
					viewScript.onerror = () => {
						const fallbackView = document.createElement("script");
						fallbackView.src = "https://unpkg.com/markmap-view@0.16";
						fallbackView.onload = () => resolve();
						fallbackView.onerror = () =>
							reject(new Error("Failed to load markmap-view from both CDNs"));
						document.head.appendChild(fallbackView);
					};
					document.head.appendChild(viewScript);
				};
				libScript.onerror = () =>
					reject(new Error("Failed to load markmap-lib from primary CDN"));
				document.head.appendChild(libScript);
			};
			d3Script.onerror = () => {
				const fallbackD3 = document.createElement("script");
				fallbackD3.src = "https://unpkg.com/d3@7";
				fallbackD3.onload = () => {
					const libScript = document.createElement("script");
					libScript.src = "https://unpkg.com/markmap-lib@0.16";
					libScript.onload = () => {
						const viewScript = document.createElement("script");
						viewScript.src = "https://unpkg.com/markmap-view@0.16";
						viewScript.onload = () => resolve();
						viewScript.onerror = () =>
							reject(
								new Error("Failed to load markmap-view from fallback CDN"),
							);
						document.head.appendChild(viewScript);
					};
					libScript.onerror = () =>
						reject(new Error("Failed to load markmap-lib from fallback CDN"));
					document.head.appendChild(libScript);
				};
				fallbackD3.onerror = () =>
					reject(new Error("Failed to load d3 from both CDNs"));
				document.head.appendChild(fallbackD3);
			};
			document.head.appendChild(d3Script);
		});
	}

	async function loadSvgPanZoom() {
		if (typeof window.svgPanZoom !== "undefined") {
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			const script = document.createElement("script");
			script.src =
				"https://unpkg.com/svg-pan-zoom@3.6.2/dist/svg-pan-zoom.min.js";
			script.onload = () => resolve();
			script.onerror = () => {
				const fallbackScript = document.createElement("script");
				fallbackScript.src =
					"https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.2/dist/svg-pan-zoom.min.js";
				fallbackScript.onload = () => resolve();
				fallbackScript.onerror = () => resolve();
				document.head.appendChild(fallbackScript);
			};
			document.head.appendChild(script);
		});
	}

	// Swap cached SVG into container, return true if cache hit
	function swapFromCache(markmapDiv, theme) {
		const cache = getCache(markmapDiv);
		const key = theme === "dark" ? "dark" : "light";
		const cached = cache[key];
		if (cached === null) {
			return false;
		}
		markmapDiv.innerHTML = cached;
		return true;
	}

	async function renderSingleMarkmap(container, theme) {
		const wrapper = container.querySelector(".markmap-wrapper");
		if (!wrapper) {
			return;
		}
		const markmapDiv = wrapper.querySelector(".markmap");
		if (!markmapDiv) {
			return;
		}
		if (renderedElements.has(markmapDiv)) {
			return;
		}
		renderedElements.add(markmapDiv);

		let code = markmapDiv.getAttribute("data-markmap-code") || "";
		if (!code) {
			code = markmapDiv.textContent?.trim() || "";
		}
		if (!code) {
			renderedElements.delete(markmapDiv);
			return;
		}

		markmapDiv.innerHTML =
			'<div class="markmap-loading">Rendering mindmap...</div>';

		try {
			const { Transformer, Markmap } = window.markmap;
			const transformer = new Transformer();
			const { root } = transformer.transform(code);

			const svgElement = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"svg",
			);
			svgElement.style.width = "100%";
			svgElement.style.height = "400px";
			markmapDiv.innerHTML = "";
			markmapDiv.appendChild(svgElement);

			const options = {
				autoFit: true,
				fitRatio: 0.95,
				duration: 0,
				maxWidth: 0,
			};
			if (theme === "dark") {
				options.color = getDarkColorFn();
			}

			const mmInstance = Markmap.create(svgElement, options, root);

			const wrapperId = wrapper.id;
			if (wrapperId) {
				markmapInstances.set(wrapperId, mmInstance);
			}

			// Wait for render to complete, then cache
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Cache the rendered SVG HTML (only after successful render)
			const renderedSvg = markmapDiv.querySelector("svg");
			if (renderedSvg) {
				const cache = getCache(markmapDiv);
				cache[theme === "dark" ? "dark" : "light"] = markmapDiv.innerHTML;
			}
		} catch (_error) {
			renderedElements.delete(markmapDiv);
			markmapDiv.innerHTML = `
				<div class="markmap-error">
					<p>Failed to render mindmap.</p>
					<button onclick="location.reload()" style="margin-top: 8px; padding: 4px 8px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
						Retry Page
					</button>
				</div>
			`;
		}
	}

	function setupLazyRenderObserver() {
		if (renderObserver) {
			renderObserver.disconnect();
		}
		renderObserver = new IntersectionObserver(
			(entries, obs) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const container = entry.target;
						obs.unobserve(container);
						renderSingleMarkmap(container, currentTheme);
					}
				});
			},
			{ rootMargin: "200px" },
		);

		document
			.querySelectorAll(".markmap-diagram-container")
			.forEach((container) => {
				const markmapDiv = container.querySelector(
					".markmap[data-markmap-code]",
				);
				if (markmapDiv && !renderedElements.has(markmapDiv)) {
					renderObserver.observe(container);
				}
			});
	}

	async function onThemeChange(newTheme) {
		if (isRendering) {
			pendingTheme = newTheme;
			return;
		}

		currentTheme = newTheme;
		isRendering = true;

		try {
			const containers = document.querySelectorAll(
				".markmap-diagram-container",
			);
			if (containers.length === 0) {
				isRendering = false;
				return;
			}

			// Phase 1: Swap all cached diagrams instantly
			const uncached = [];
			containers.forEach((container) => {
				const wrapper = container.querySelector(".markmap-wrapper");
				if (!wrapper) {
					return;
				}
				const markmapDiv = wrapper.querySelector(".markmap");
				if (!markmapDiv) {
					return;
				}
				if (
					!renderedElements.has(markmapDiv) &&
					!markmapDiv.querySelector("svg")
				) {
					// Not yet rendered — IntersectionObserver will handle
					return;
				}
				if (swapFromCache(markmapDiv, newTheme)) {
					renderedElements.add(markmapDiv);
				} else {
					// Rendered but no cache for this theme — need to render
					renderedElements.delete(markmapDiv);
					uncached.push(container);
				}
			});

			// Phase 2: Render uncached diagrams sequentially with yield between each
			if (uncached.length > 0) {
				for (const container of uncached) {
					await renderSingleMarkmap(container, newTheme);
					await new Promise((r) => setTimeout(r, 0));
				}
			}

			// Re-init controls for all rendered containers
			initControls();
			retryCount = 0;
		} catch (_error) {
			if (retryCount < MAX_RETRIES) {
				retryCount++;
				setTimeout(() => onThemeChange(currentTheme), RETRY_DELAY * retryCount);
			}
		} finally {
			isRendering = false;
			if (pendingTheme !== null && pendingTheme !== currentTheme) {
				const next = pendingTheme;
				pendingTheme = null;
				onThemeChange(next);
			} else {
				pendingTheme = null;
			}
		}
	}

	function _destroyAllInstances() {
		markmapInstances.forEach((instance) => {
			try {
				instance.destroy();
			} catch (_e) {
				// ignore
			}
		});
		markmapInstances.clear();
		document
			.querySelectorAll(".markmap-diagram-container")
			.forEach((container) => {
				const controls = container.querySelector(".markmap-controls");
				if (controls) {
					controls.remove();
				}
				container.removeAttribute("data-markmap-init");
			});
	}

	function initControls() {
		const containers = document.querySelectorAll(".markmap-diagram-container");
		containers.forEach((container) => {
			if (container.hasAttribute("data-markmap-init")) {
				return;
			}
			const wrapper = container.querySelector(".markmap-wrapper");
			if (!wrapper) {
				return;
			}
			const wrapperId = wrapper.id;
			if (!wrapperId) {
				return;
			}
			const mmInstance = markmapInstances.get(wrapperId);
			if (!mmInstance) {
				return;
			}
			container.setAttribute("data-markmap-init", "true");

			const controlsDiv = document.createElement("div");
			controlsDiv.className = "markmap-controls";
			const buttons = [
				{
					label: "+",
					title: "放大",
					action: () => mmInstance.rescale(1.25),
				},
				{
					label: "−",
					title: "缩小",
					action: () => mmInstance.rescale(0.8),
				},
				{
					label: "↺",
					title: "重置",
					action: () => mmInstance.fit(),
				},
				{
					label: "⛶",
					title: "全屏",
					action: () => openFullscreen(container),
				},
			];
			buttons.forEach((btn) => {
				const button = document.createElement("button");
				button.className = "markmap-ctrl-btn";
				button.textContent = btn.label;
				button.title = btn.title;
				button.addEventListener("click", (e) => {
					e.preventDefault();
					e.stopPropagation();
					btn.action();
				});
				controlsDiv.appendChild(button);
			});
			container.appendChild(controlsDiv);
		});
	}

	function openFullscreen(container) {
		const svgElement = container.querySelector(".markmap svg");
		if (!svgElement) {
			return;
		}
		const overlay = document.createElement("div");
		overlay.className = "markmap-fullscreen-overlay";
		const content = document.createElement("div");
		content.className = "markmap-fs-content";
		const clonedSvg = svgElement.cloneNode(true);
		clonedSvg.style.cssText =
			"width:100%;height:100%;max-width:none;max-height:none;filter:none;";
		content.appendChild(clonedSvg);

		const fsControls = document.createElement("div");
		fsControls.className = "markmap-fs-controls";
		let fsInstance = null;

		const closeOverlay = () => {
			if (fsInstance) {
				try {
					fsInstance.destroy();
				} catch (_e) {
					// ignore
				}
			}
			overlay.remove();
			document.removeEventListener("keydown", escHandler);
			document.body.style.overflow = "";
		};
		const escHandler = (e) => {
			if (e.key === "Escape") {
				closeOverlay();
			}
		};

		const fsButtons = [
			{
				label: "+",
				title: "放大",
				action: () => fsInstance?.zoomIn(),
			},
			{
				label: "−",
				title: "缩小",
				action: () => fsInstance?.zoomOut(),
			},
			{
				label: "↺",
				title: "重置",
				action: () => {
					if (fsInstance) {
						fsInstance.resetZoom();
						fsInstance.resetPan();
						fsInstance.center();
					}
				},
			},
			{ label: "✕", title: "关闭", action: closeOverlay },
		];
		fsButtons.forEach((btn) => {
			const button = document.createElement("button");
			button.className = "markmap-ctrl-btn";
			button.textContent = btn.label;
			button.title = btn.title;
			button.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				btn.action();
			});
			fsControls.appendChild(button);
		});

		overlay.appendChild(content);
		overlay.appendChild(fsControls);
		document.body.appendChild(overlay);
		document.body.style.overflow = "hidden";
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				closeOverlay();
			}
		});
		document.addEventListener("keydown", escHandler);

		requestAnimationFrame(() => {
			try {
				const bbox = clonedSvg.getBBox();
				if (bbox.width > 0 && bbox.height > 0) {
					const padding = 20;
					clonedSvg.setAttribute(
						"viewBox",
						`${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`,
					);
				}
				if (typeof window.svgPanZoom === "function") {
					fsInstance = window.svgPanZoom(clonedSvg, {
						panEnabled: true,
						zoomEnabled: true,
						controlIconsEnabled: false,
						mouseWheelZoomEnabled: true,
						dblClickZoomEnabled: true,
						minZoom: 0.3,
						maxZoom: 10,
						fit: true,
						center: true,
						zoomScaleSensitivity: 0.3,
					});
				}
			} catch (_e) {
				// svg-pan-zoom init failed
			}
		});
	}

	function setupEventListeners() {
		document.addEventListener("astro:page-load", () => {
			retryCount = 0;
			setupLazyRenderObserver();
		});

		// visibilitychange: only re-init controls, NOT full re-render
		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				initControls();
			}
		});
	}

	async function initialize() {
		try {
			const coordinator = window.__diagramThemeCoordinator;
			if (coordinator) {
				currentTheme = coordinator.getTheme();
				coordinator.subscribe(onThemeChange);
			} else {
				currentTheme = document.documentElement.classList.contains("dark")
					? "dark"
					: "default";
			}

			setupEventListeners();
			await loadMarkmap();
			loadSvgPanZoom();
			setupLazyRenderObserver();
		} catch (_error) {
			// Initialization failed
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize, {
			once: true,
		});
	} else {
		initialize();
	}
})();
