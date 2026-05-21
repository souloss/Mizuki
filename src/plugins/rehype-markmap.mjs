import { h } from "hastscript";
import { visit } from "unist-util-visit";

import markmapRenderScript from "./markmap-render-script.js?raw";

/**
 * 递归提取 HAST 节点树中的所有文本内容
 */
function extractText(node) {
	if (node.type === "text") return node.value || "";
	if (node.children) return node.children.map(extractText).join("");
	return "";
}

/**
 * 生成当前 HAST 节点的随机 id，避免同一页多个图表冲突
 */
function generateId() {
	const rand = Math.random().toString(36).slice(2, 8);
	return `markmap-${rand}`;
}

/** 已注入客户端脚本的 tree 集合，用于避免同一 tree 多次注入 */
const scriptInjectedTrees = new WeakSet();

/**
 * rehype 插件：把 `div.markmap-container`（由 remark-markmap 标记）改写为
 * 可交互的 `.markmap-diagram-container`，并在每棵 tree 末尾注入一次客户端
 * 渲染脚本，负责主题切换、缩放/全屏控制等。
 *
 * @returns {(tree: import('hast').Root) => void} rehype transformer
 */
export function rehypeMarkmap() {
	return (tree) => {
		let foundAny = false;

		visit(tree, "element", (node) => {
			if (node.tagName !== "div" || !node.properties) {
				return;
			}
			const classProp = node.properties.className;
			const hasMarker = Array.isArray(classProp)
				? classProp.includes("markmap-container")
				: typeof classProp === "string"
					? classProp.split(/\s+/).includes("markmap-container")
					: false;
			if (!hasMarker) {
				return;
			}

			// 优先使用 data-markmap-code 属性，为空时从子节点文本提取（MDX 兼容）
			let markmapCode = node.properties["data-markmap-code"] || "";
			if (!markmapCode) {
				markmapCode = extractText(node).trim();
			}
			if (!markmapCode) {
				return;
			}

			const markmapId = generateId();

			// 创建 Markmap 容器
			const markmapContainer = h(
				"div",
				{
					class: "markmap-wrapper",
					id: markmapId,
				},
				[
					h(
						"div",
						{
							class: "markmap",
							"data-markmap-code": markmapCode,
						},
						markmapCode,
					),
				],
			);

			node.tagName = "div";
			node.properties = { class: "markmap-diagram-container" };
			node.children = [markmapContainer];

			foundAny = true;
		});

		if (foundAny && !scriptInjectedTrees.has(tree)) {
			scriptInjectedTrees.add(tree);
			const script = h(
				"script",
				{ type: "text/javascript" },
				markmapRenderScript,
			);
			tree.children = [...(tree.children || []), script];
		}
	};
}

export default rehypeMarkmap;
