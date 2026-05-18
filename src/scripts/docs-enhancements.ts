function text(value: string): Text {
	return document.createTextNode(value);
}

function createIcon(name: string): HTMLSpanElement {
	const icon = document.createElement("span");
	icon.className = "docs-enhanced-card-icon";
	icon.textContent = name;
	return icon;
}

function enhanceRepoCards(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("repocard").forEach((card) => {
		if (card.dataset.enhanced === "true") {return;}
		const repo = card.getAttribute("repo") || "";
		if (!repo) {return;}

		const link = document.createElement("a");
		link.href = `https://github.com/${repo}`;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.className = "docs-repo-card no-styling";

		const title = document.createElement("span");
		title.className = "docs-repo-card-title";
		title.append(createIcon("GitHub"), text(repo));

		const meta = document.createElement("span");
		meta.className = "docs-repo-card-meta";
		meta.textContent = "Repository";

		link.append(title, meta);
		card.replaceChildren(link);
		card.dataset.enhanced = "true";
	});
}

function enhanceLinkCards(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("linkcard").forEach((card) => {
		if (card.dataset.enhanced === "true") {return;}
		const href = card.getAttribute("href") || "#";
		const title = card.getAttribute("title") || href;

		const link = document.createElement("a");
		link.href = href;
		link.className = "docs-link-card no-styling";
		if (/^https?:\/\//.test(href)) {
			link.target = "_blank";
			link.rel = "noopener noreferrer";
		}

		const titleEl = document.createElement("span");
		titleEl.className = "docs-link-card-title";
		titleEl.textContent = title;

		const arrow = document.createElement("span");
		arrow.className = "docs-link-card-arrow";
		arrow.textContent = "->";

		link.append(titleEl, arrow);
		card.replaceChildren(link);
		card.dataset.enhanced = "true";
	});
}

function enhanceTabs(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("tabs").forEach((tabs) => {
		if (tabs.dataset.enhanced === "true") {return;}

		const sourceChildren = Array.from(tabs.children);
		const panes: { title: string; nodes: Element[] }[] = [];
		let current: { title: string; nodes: Element[] } | undefined;

		for (const child of sourceChildren) {
			if (/^H[1-6]$/.test(child.tagName)) {
				current = {
					title: child.textContent?.replace(/#$/, "").trim() || `Tab ${panes.length + 1}`,
					nodes: [],
				};
				panes.push(current);
			} else if (child.tagName === "SECTION" && /^H[1-6]$/.test(child.firstElementChild?.tagName || "")) {
				const heading = child.firstElementChild as HTMLElement;
				current = {
					title: heading.textContent?.replace(/#$/, "").trim() || `Tab ${panes.length + 1}`,
					nodes: Array.from(child.children).slice(1),
				};
				panes.push(current);
			} else if (current) {
				current.nodes.push(child);
			}
		}

		if (panes.length === 0) {return;}

		const tabList = document.createElement("div");
		tabList.className = "docs-tabs-list";
		const panelWrap = document.createElement("div");
		panelWrap.className = "docs-tabs-panels";

		panes.forEach((pane, index) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "docs-tab-button";
			button.textContent = pane.title;
			button.setAttribute("aria-selected", String(index === 0));

			const panel = document.createElement("div");
			panel.className = "docs-tab-panel";
			panel.hidden = index !== 0;
			panel.append(...pane.nodes);

			button.addEventListener("click", () => {
				tabList.querySelectorAll<HTMLButtonElement>(".docs-tab-button").forEach((item) => {
					item.setAttribute("aria-selected", String(item === button));
				});
				panelWrap.querySelectorAll<HTMLElement>(".docs-tab-panel").forEach((item) => {
					item.hidden = item !== panel;
				});
			});

			tabList.append(button);
			panelWrap.append(panel);
		});

		tabs.replaceChildren(tabList, panelWrap);
		tabs.dataset.enhanced = "true";
	});
}

function enhanceCollapse(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("collapse").forEach((collapse) => {
		if (collapse.dataset.enhanced === "true") {return;}
		const firstChild = collapse.firstElementChild;
		if (!firstChild) {return;}
		firstChild.setAttribute("role", "button");
		firstChild.setAttribute("tabindex", "0");
		firstChild.addEventListener("click", () => collapse.classList.toggle("is-open"));
		firstChild.addEventListener("keydown", (event) => {
			const keyboardEvent = event as KeyboardEvent;
			if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
				keyboardEvent.preventDefault();
				collapse.classList.toggle("is-open");
			}
		});
		collapse.dataset.enhanced = "true";
	});
}

export function initDocsEnhancements(root: ParentNode = document) {
	enhanceRepoCards(root);
	enhanceLinkCards(root);
	enhanceTabs(root);
	enhanceCollapse(root);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => initDocsEnhancements());
} else {
	initDocsEnhancements();
}

document.addEventListener("astro:page-load", () => initDocsEnhancements());
document.addEventListener("swup:content:replace", () => initDocsEnhancements());
