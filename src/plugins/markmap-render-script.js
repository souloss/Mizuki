(() => {
	// 单例模式：检查是否已经初始化过
	if (window.markmapInitialized) {
		return;
	}

	window.markmapInitialized = true;

	let isRendering = false;
	let retryCount = 0;
	const MAX_RETRIES = 3;
	const RETRY_DELAY = 1000;

	// 存储 Markmap 实例，key 为容器 id
	const markmapInstances = new Map();

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
					viewScript.onload = () => {
						resolve();
					};
					viewScript.onerror = () => {
						const fallbackView = document.createElement("script");
						fallbackView.src = "https://unpkg.com/markmap-view@0.16";
						fallbackView.onload = () => {
							resolve();
						};
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
						viewScript.onload = () => {
							resolve();
						};
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
				fallbackScript.onerror = () => {
					// svg-pan-zoom 仅全屏模式使用，加载失败不阻塞
					resolve();
				};
				document.head.appendChild(fallbackScript);
			};
			document.head.appendChild(script);
		});
	}

	function applyThemeToMarkmap(svgElement, isDark) {
		if (!svgElement) {
			return;
		}
		if (isDark) {
			svgElement.style.filter = "brightness(0.9) contrast(1.1)";
		} else {
			svgElement.style.filter = "none";
		}
	}

	function destroyAllControls() {
		markmapInstances.forEach((instance, containerId) => {
			try {
				instance.destroy();
			} catch (_e) {
				// ignore
			}
			const container = document.getElementById(containerId);
			if (container) {
				const controls = container.querySelector(".markmap-controls");
				if (controls) {
					controls.remove();
				}
				container.removeAttribute("data-markmap-init");
			}
		});
		markmapInstances.clear();
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
					label: "\u2212",
					title: "缩小",
					action: () => mmInstance.rescale(0.8),
				},
				{
					label: "\u21BA",
					title: "重置",
					action: () => mmInstance.fit(),
				},
				{
					label: "\u26F6",
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

		const isDark = document.documentElement.classList.contains("dark");

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

		// 全屏模式下尝试使用 svg-pan-zoom（克隆的 SVG 没有 D3 zoom 行为）
		const fsButtons = [
			{
				label: "+",
				title: "放大",
				action: () => fsInstance?.zoomIn(),
			},
			{
				label: "\u2212",
				title: "缩小",
				action: () => fsInstance?.zoomOut(),
			},
			{
				label: "\u21BA",
				title: "重置",
				action: () => {
					if (fsInstance) {
						fsInstance.resetZoom();
						fsInstance.resetPan();
						fsInstance.center();
					}
				},
			},
			{ label: "\u2715", title: "关闭", action: closeOverlay },
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

		// 全屏模式：为克隆的 SVG 设置 viewBox 并使用 svg-pan-zoom
		requestAnimationFrame(() => {
			try {
				// 克隆的 SVG 没有 viewBox，需要手动设置
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

				applyThemeToMarkmap(clonedSvg, isDark);
			} catch (_e) {
				// svg-pan-zoom 初始化失败时，全屏仍可查看，只是没有缩放控制
			}
		});
	}

	async function renderMarkmaps() {
		if (isRendering) {
			return;
		}

		if (!window.markmap?.Transformer || !window.markmap.Markmap) {
			return;
		}

		isRendering = true;

		destroyAllControls();

		try {
			const containers = document.querySelectorAll(
				".markmap-diagram-container",
			);
			if (containers.length === 0) {
				isRendering = false;
				return;
			}

			// 等待 DOM 布局稳定
			await new Promise((resolve) => setTimeout(resolve, 100));

			const { Transformer, Markmap } = window.markmap;
			const transformer = new Transformer();
			const isDark = document.documentElement.classList.contains("dark");

			for (const container of containers) {
				const wrapper = container.querySelector(".markmap-wrapper");
				if (!wrapper) {
					continue;
				}

				const markmapDiv = wrapper.querySelector(".markmap");
				if (!markmapDiv) {
					continue;
				}

				let code = markmapDiv.getAttribute("data-markmap-code") || "";
				if (!code) {
					code = markmapDiv.textContent?.trim() || "";
				}
				if (!code) {
					continue;
				}

				markmapDiv.innerHTML =
					'<div class="markmap-loading">Rendering mindmap...</div>';

				try {
					const { root } = transformer.transform(code);

					const svgElement = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"svg",
					);
					svgElement.style.width = "100%";
					svgElement.style.height = "400px";
					markmapDiv.innerHTML = "";
					markmapDiv.appendChild(svgElement);

					const mmInstance = Markmap.create(
						svgElement,
						{
							autoFit: true,
							fitRatio: 0.95,
							duration: 0,
							maxWidth: 0,
						},
						root,
					);

					// 存储 Markmap 实例，key 为 wrapper 的 id
					const wrapperId = wrapper.id;
					if (wrapperId) {
						markmapInstances.set(wrapperId, mmInstance);
					}

					const renderedSvg = markmapDiv.querySelector("svg");
					if (renderedSvg) {
						applyThemeToMarkmap(renderedSvg, isDark);
					}
				} catch (_error) {
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

			// 等待 Markmap 渲染完成后再初始化控制按钮
			await new Promise((resolve) => setTimeout(resolve, 300));
			initControls();
			retryCount = 0;
		} catch (_error) {
			if (retryCount < MAX_RETRIES) {
				retryCount++;
				setTimeout(() => renderMarkmaps(), RETRY_DELAY * retryCount);
			}
		} finally {
			isRendering = false;
		}
	}

	function setupMutationObserver() {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "class"
				) {
					const isDark = document.documentElement.classList.contains("dark");
					const svgElements = document.querySelectorAll(".markmap svg");
					for (const svg of svgElements) {
						applyThemeToMarkmap(svg, isDark);
					}
					break;
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
	}

	function setupEventListeners() {
		document.addEventListener("astro:page-load", () => {
			retryCount = 0;
			renderMarkmaps();
		});

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				renderMarkmaps();
			}
		});
	}

	async function initialize() {
		try {
			setupMutationObserver();
			setupEventListeners();
			await loadMarkmap();
			// svg-pan-zoom 仅全屏模式使用，不阻塞主渲染流程
			loadSvgPanZoom();
			await renderMarkmaps();
		} catch (_error) {
			// 初始化失败
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize, { once: true });
	} else {
		initialize();
	}
})();
