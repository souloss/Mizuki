import { visit } from "unist-util-visit";

const markPattern = /==([^=\n][\s\S]*?[^=\n])==/g;

function createMarkNodes(value) {
	const nodes = [];
	let lastIndex = 0;

	for (const match of value.matchAll(markPattern)) {
		const index = match.index ?? 0;
		if (index > lastIndex) {
			nodes.push({ type: "text", value: value.slice(lastIndex, index) });
		}
		nodes.push({
			type: "html",
			value: `<mark>${escapeHtml(match[1])}</mark>`,
		});
		lastIndex = index + match[0].length;
	}

	if (lastIndex < value.length) {
		nodes.push({ type: "text", value: value.slice(lastIndex) });
	}

	return nodes;
}

function escapeHtml(value) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function remarkMark() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (!parent || typeof index !== "number" || !markPattern.test(node.value)) {
				markPattern.lastIndex = 0;
				return;
			}
			markPattern.lastIndex = 0;
			parent.children.splice(index, 1, ...createMarkNodes(node.value));
			return index + 1;
		});
	};
}
