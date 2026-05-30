(() => {
	// 单例模式：检查是否已经初始化过
	if (window.mermaidInitialized) {
		return;
	}

	window.mermaidInitialized = true;

	// 记录当前主题状态，避免不必要的重新渲染
	let currentTheme = null;
	let isRendering = false;
	let retryCount = 0;
	const MAX_RETRIES = 3;
	const RETRY_DELAY = 1000;
	// 主题切换防抖
	let themeChangeTimer = null;
	// IntersectionObserver 实例（渲染用）
	let renderObserver = null;
	// IntersectionObserver 实例（pan-zoom 用）
	let panZoomObserver = null;
	// 已渲染的图表集合，防止重复渲染
	const renderedElements = new WeakSet();

	// 为所有未渲染的 mermaid 容器注入骨架屏占位符
	function injectSkeletons() {
		document
			.querySelectorAll(".mermaid-diagram-container")
			.forEach((container) => {
				if (container.querySelector(".mermaid-skeleton")) {
					return;
				}
				const skeleton = document.createElement("div");
				skeleton.className = "mermaid-skeleton";
				skeleton.innerHTML =
					'<div class="skeleton-icon"></div><div class="skeleton-lines"><span></span><span></span><span></span></div>';
				container.insertBefore(skeleton, container.firstChild);
			});
	}

	// 移除指定容器的骨架屏
	function removeSkeleton(container) {
		const skeleton = container.querySelector(".mermaid-skeleton");
		if (skeleton) {
			skeleton.remove();
		}
	}

	// 检查主题是否真的发生了变化
	function hasThemeChanged() {
		const isDark = document.documentElement.classList.contains("dark");
		const newTheme = isDark ? "dark" : "default";

		if (currentTheme !== newTheme) {
			currentTheme = newTheme;
			return true;
		}
		return false;
	}

	// 等待 Mermaid 库加载完成
	function waitForMermaid(timeout = 10000) {
		return new Promise((resolve, reject) => {
			const startTime = Date.now();

			function check() {
				if (window.mermaid && typeof window.mermaid.initialize === "function") {
					resolve(window.mermaid);
				} else if (Date.now() - startTime > timeout) {
					reject(new Error("Mermaid library failed to load within timeout"));
				} else {
					setTimeout(check, 100);
				}
			}

			check();
		});
	}

	// 设置 MutationObserver 监听 html 元素的 class 属性变化
	function setupMutationObserver() {
		const obs = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "class"
				) {
					const target = mutation.target;
					const wasDark = mutation.oldValue
						? mutation.oldValue.includes("dark")
						: false;
					const isDark = target.classList.contains("dark");

					if (wasDark !== isDark) {
						if (hasThemeChanged()) {
							clearTimeout(themeChangeTimer);
							themeChangeTimer = setTimeout(() => reRenderAllDiagrams(), 300);
						}
					}
				}
			});
		});

		obs.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
			attributeOldValue: true,
		});
	}

	// 设置其他事件监听器
	function setupEventListeners() {
		document.addEventListener("astro:page-load", () => {
			currentTheme = null;
			retryCount = 0;
			if (hasThemeChanged()) {
				setupLazyRenderObserver();
			}
		});

		document.addEventListener("mizuki:page:loaded", () => {
			currentTheme = null;
			retryCount = 0;
			if (hasThemeChanged()) {
				setupLazyRenderObserver();
			}
		});

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				setupLazyRenderObserver();
			}
		});
	}

	async function initializeMermaid() {
		try {
			await waitForMermaid();

			window.mermaid.initialize({
				startOnLoad: false,
				theme: "default",
				themeVariables: {
					fontFamily: "inherit",
					fontSize: "16px",
				},
				securityLevel: "loose",
				errorLevel: "warn",
				logLevel: "error",
			});

			// 不立即渲染，交给 IntersectionObserver 按需渲染
			setupLazyRenderObserver();
		} catch (error) {
			console.error("Failed to initialize Mermaid:", error);
			if (retryCount < MAX_RETRIES) {
				retryCount++;
				setTimeout(() => initializeMermaid(), RETRY_DELAY * retryCount);
			}
		}
	}

	// 让出主线程，保持 UI 响应
	function yieldToMain() {
		return new Promise((resolve) => setTimeout(resolve, 0));
	}

	// 设置懒渲染 Observer：只在图表接近视口时才渲染
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
						renderDiagramInContainer(container);
					}
				});
			},
			{ rootMargin: "200px" },
		);

		// 观察所有未渲染的 mermaid 容器
		injectSkeletons();
		document
			.querySelectorAll(".mermaid-diagram-container")
			.forEach((container) => {
				const mermaidEl = container.querySelector(
					".mermaid[data-mermaid-code]",
				);
				if (mermaidEl && !renderedElements.has(mermaidEl)) {
					renderObserver.observe(container);
				}
			});
	}

	// 渲染单个容器中的图表
	async function renderDiagramInContainer(container) {
		const mermaidEl = container.querySelector(".mermaid[data-mermaid-code]");
		if (!mermaidEl || renderedElements.has(mermaidEl)) {
			return;
		}

		renderedElements.add(mermaidEl);

		const isDark = document.documentElement.classList.contains("dark");
		const theme = isDark ? "dark" : "default";

		// 每次渲染前更新主题
		window.mermaid.initialize({
			startOnLoad: false,
			theme: theme,
			themeVariables: {
				fontFamily: "inherit",
				fontSize: "16px",
				primaryColor: isDark ? "#ffffff" : "#000000",
				primaryTextColor: isDark ? "#ffffff" : "#000000",
				primaryBorderColor: isDark ? "#ffffff" : "#000000",
				lineColor: isDark ? "#ffffff" : "#000000",
				secondaryColor: isDark ? "#333333" : "#f0f0f0",
				tertiaryColor: isDark ? "#555555" : "#e0e0e0",
			},
			securityLevel: "loose",
			errorLevel: "warn",
			logLevel: "error",
		});

		await renderSingleDiagram(mermaidEl, isDark);

		// 渲染完成后，移除骨架屏
		removeSkeleton(container);

		// 让出主线程
		await yieldToMain();

		// 设置 pan-zoom 懒加载
		setupPanZoomObserver(container);
	}

	// 渲染单个图表
	async function renderSingleDiagram(element, isDark) {
		let attempts = 0;
		const maxAttempts = 3;

		while (attempts < maxAttempts) {
			try {
				const code = element.getAttribute("data-mermaid-code");
				if (!code) {
					break;
				}

				const { svg } = await window.mermaid.render(
					`mermaid-${Date.now()}-${attempts}`,
					code,
				);

				element.innerHTML = svg;

				// 添加响应式支持
				const svgElement = element.querySelector("svg");
				if (svgElement) {
					svgElement.setAttribute("width", "100%");
					svgElement.removeAttribute("height");
					svgElement.style.maxWidth = "100%";
					svgElement.style.height = "auto";

					if (isDark) {
						svgElement.style.filter = "brightness(0.9) contrast(1.1)";
					} else {
						svgElement.style.filter = "none";
					}
				}

				element.setAttribute("data-mermaid-rendered", "true");
				break;
			} catch (error) {
				attempts++;
				console.warn(`Mermaid rendering attempt ${attempts} failed:`, error);

				if (attempts >= maxAttempts) {
					console.error(
						`Failed to render Mermaid diagram after ${maxAttempts} attempts:`,
						error,
					);
					element.innerHTML = `
						<div class="mermaid-error">
							<p>Failed to render diagram after ${maxAttempts} attempts.</p>
							<button onclick="location.reload()" style="margin-top: 8px; padding: 4px 8px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
								Retry Page
							</button>
						</div>
					`;
					// 移除骨架屏即使渲染失败
					const container = element.closest(".mermaid-diagram-container");
					if (container) {
						const skeleton = container.querySelector(".mermaid-skeleton");
						if (skeleton) {
							skeleton.remove();
						}
					}
				} else {
					await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
				}
			}
		}
	}

	// 主题切换时重新渲染所有已渲染的图表
	async function reRenderAllDiagrams() {
		if (isRendering) {
			return;
		}

		if (!window.mermaid || typeof window.mermaid.render !== "function") {
			return;
		}

		isRendering = true;
		document.dispatchEvent(new CustomEvent("mermaid:render:start"));

		destroyAllPanZoom();

		try {
			const mermaidElements = document.querySelectorAll(
				".mermaid[data-mermaid-rendered]",
			);

			if (mermaidElements.length === 0) {
				isRendering = false;
				document.dispatchEvent(new CustomEvent("mermaid:render:done"));
				return;
			}

			const isDark = document.documentElement.classList.contains("dark");
			const theme = isDark ? "dark" : "default";

			window.mermaid.initialize({
				startOnLoad: false,
				theme: theme,
				themeVariables: {
					fontFamily: "inherit",
					fontSize: "16px",
					primaryColor: isDark ? "#ffffff" : "#000000",
					primaryTextColor: isDark ? "#ffffff" : "#000000",
					primaryBorderColor: isDark ? "#ffffff" : "#000000",
					lineColor: isDark ? "#ffffff" : "#000000",
					secondaryColor: isDark ? "#333333" : "#f0f0f0",
					tertiaryColor: isDark ? "#555555" : "#e0e0e0",
				},
				securityLevel: "loose",
				errorLevel: "warn",
				logLevel: "error",
			});

			for (const element of mermaidElements) {
				// 重新渲染：清除 rendered 标记
				element.removeAttribute("data-mermaid-rendered");
				renderedElements.delete(element);
				await renderSingleDiagram(element, isDark);
				await yieldToMain();
			}

			retryCount = 0;
		} catch (error) {
			console.error("Error in reRenderAllDiagrams:", error);
		} finally {
			isRendering = false;
			document.dispatchEvent(new CustomEvent("mermaid:render:done"));
		}
	}

	// Pan-zoom 懒加载 Observer
	function setupPanZoomObserver(container) {
		if (panZoomObserver) {
			// 如果已经在观察中，直接观察新容器
		} else {
			panZoomObserver = new IntersectionObserver(
				(entries, obs) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const c = entry.target;
							obs.unobserve(c);
							initPanZoomForContainer(c);
						}
					});
				},
				{ rootMargin: "100px" },
			);
		}

		if (!container.hasAttribute("data-panzoom-init")) {
			panZoomObserver.observe(container);
		}
	}

	// 初始化主题状态
	function initializeThemeState() {
		const isDark = document.documentElement.classList.contains("dark");
		currentTheme = isDark ? "dark" : "default";
	}

	// 加载 Mermaid 库
	async function loadMermaid() {
		if (typeof window.mermaid !== "undefined") {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src =
				"https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js";

			script.onload = () => {
				resolve();
			};

			script.onerror = () => {
				const fallbackScript = document.createElement("script");
				fallbackScript.src =
					"https://unpkg.com/mermaid@11.12.0/dist/mermaid.min.js";

				fallbackScript.onload = () => {
					resolve();
				};

				fallbackScript.onerror = () => {
					reject(
						new Error(
							"Failed to load Mermaid from both primary and fallback CDNs",
						),
					);
				};

				document.head.appendChild(fallbackScript);
			};

			document.head.appendChild(script);
		});
	}

	// 加载 svg-pan-zoom 库
	async function loadSvgPanZoom() {
		if (typeof window.svgPanZoom !== "undefined") {
			return Promise.resolve();
		}

		return new Promise((resolve, _reject) => {
			const script = document.createElement("script");
			script.src =
				"https://unpkg.com/svg-pan-zoom@3.6.2/dist/svg-pan-zoom.min.js";
			script.onload = () => {
				resolve();
			};

			script.onerror = () => {
				const fallbackScript = document.createElement("script");
				fallbackScript.src =
					"https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.2/dist/svg-pan-zoom.min.js";

				fallbackScript.onload = () => {
					resolve();
				};

				fallbackScript.onerror = () => {
					console.warn(
						"Failed to load svg-pan-zoom, pan/zoom features will be unavailable",
					);
					resolve();
				};

				document.head.appendChild(fallbackScript);
			};

			document.head.appendChild(script);
		});
	}

	// 销毁所有 pan-zoom 实例
	function destroyAllPanZoom() {
		const containers = document.querySelectorAll(
			".mermaid-diagram-container[data-panzoom-init]",
		);
		containers.forEach((container) => {
			if (container._panZoomInstance) {
				try {
					container._panZoomInstance.destroy();
				} catch (_e) {
					// 忽略销毁错误
				}
				container._panZoomInstance = null;
			}
			const controls = container.querySelector(".mermaid-controls");
			if (controls) {
				controls.remove();
			}
			container.removeAttribute("data-panzoom-init");
		});
	}

	// 为单个容器初始化 pan-zoom（懒加载）
	function initPanZoomForContainer(container) {
		if (typeof window.svgPanZoom !== "function") {
			return;
		}

		if (container.hasAttribute("data-panzoom-init")) {
			return;
		}

		const svgElement = container.querySelector(".mermaid svg");
		if (!svgElement) {
			return;
		}

		if (!svgElement.getAttribute("viewBox")) {
			return;
		}

		const rect = svgElement.getBoundingClientRect();
		svgElement.setAttribute("width", `${rect.width}px`);
		svgElement.setAttribute("height", `${rect.height}px`);
		svgElement.style.maxWidth = "none";
		svgElement.style.height = "";

		try {
			const panZoomInstance = window.svgPanZoom(svgElement, {
				panEnabled: true,
				zoomEnabled: true,
				controlIconsEnabled: false,
				mouseWheelZoomEnabled: true,
				dblClickZoomEnabled: true,
				minZoom: 0.5,
				maxZoom: 5,
				fit: true,
				center: true,
				zoomScaleSensitivity: 0.3,
			});

			container._panZoomInstance = panZoomInstance;
			container.setAttribute("data-panzoom-init", "true");

			// 创建控制栏
			const controlsDiv = document.createElement("div");
			controlsDiv.className = "mermaid-controls";

			const buttons = [
				{
					label: "+",
					title: "放大",
					action: () => panZoomInstance.zoomIn(),
				},
				{
					label: "−",
					title: "缩小",
					action: () => panZoomInstance.zoomOut(),
				},
				{
					label: "↺",
					title: "重置",
					action: () => {
						panZoomInstance.resetZoom();
						panZoomInstance.resetPan();
						panZoomInstance.center();
					},
				},
				{
					label: "⛶",
					title: "全屏",
					action: () => openFullscreen(container),
				},
			];

			buttons.forEach((btn) => {
				const button = document.createElement("button");
				button.className = "mermaid-ctrl-btn";
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
		} catch (e) {
			console.warn("Failed to initialize svg-pan-zoom for a diagram:", e);
		}
	}

	// 全屏查看
	function openFullscreen(container) {
		const svgElement = container.querySelector(".mermaid svg");
		if (!svgElement) {
			return;
		}

		const overlay = document.createElement("div");
		overlay.className = "mermaid-fullscreen-overlay";

		const content = document.createElement("div");
		content.className = "mermaid-fs-content";

		const clonedSvg = svgElement.cloneNode(true);
		clonedSvg.style.filter = "";
		clonedSvg.setAttribute("width", "100%");
		clonedSvg.setAttribute("height", "100%");
		clonedSvg.style.maxWidth = "none";
		content.appendChild(clonedSvg);

		const fsControls = document.createElement("div");
		fsControls.className = "mermaid-fs-controls";

		let fsInstance = null;

		const closeOverlay = () => {
			if (fsInstance) {
				try {
					fsInstance.destroy();
				} catch (_e) {
					// 忽略
				}
			}
			overlay.remove();
			document.removeEventListener("keydown", escHandler);
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
			button.className = "mermaid-ctrl-btn";
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

		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				closeOverlay();
			}
		});

		document.addEventListener("keydown", escHandler);

		requestAnimationFrame(() => {
			try {
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
			} catch (e) {
				console.warn("Failed to initialize fullscreen pan-zoom:", e);
			}
		});
	}

	// 主初始化函数
	async function initialize() {
		try {
			setupMutationObserver();
			setupEventListeners();
			initializeThemeState();
			injectSkeletons();

			await Promise.all([loadMermaid(), loadSvgPanZoom()]);
			await initializeMermaid();
		} catch (error) {
			console.error("Failed to initialize Mermaid system:", error);
		}
	}

	// 启动初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
})();
