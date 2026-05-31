// diagram-theme-coordinator.js
// Single MutationObserver + debounced theme dispatcher.
// All diagram plugins subscribe instead of observing the DOM themselves.
(() => {
	if (window.__diagramThemeCoordinator) {
		return;
	}

	let currentTheme = null;
	let pendingTimer = null;
	const DEBOUNCE_MS = 150;
	const listeners = new Set();

	function getTheme() {
		return document.documentElement.classList.contains("dark")
			? "dark"
			: "default";
	}

	function notify(theme) {
		listeners.forEach((fn) => {
			try {
				fn(theme);
			} catch (e) {
				console.warn("Diagram theme listener error:", e);
			}
		});
	}

	function onClassChange() {
		const newTheme = getTheme();
		if (newTheme === currentTheme) {
			return;
		}
		currentTheme = newTheme;
		clearTimeout(pendingTimer);
		pendingTimer = setTimeout(() => notify(newTheme), DEBOUNCE_MS);
	}

	new MutationObserver(onClassChange).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
		attributeOldValue: true,
	});

	currentTheme = getTheme();

	window.__diagramThemeCoordinator = {
		getTheme,
		subscribe(fn) {
			listeners.add(fn);
			return () => listeners.delete(fn);
		},
		init(fn) {
			fn(currentTheme);
			return this.subscribe(fn);
		},
	};
})();
