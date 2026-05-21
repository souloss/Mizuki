import { visit } from "unist-util-visit";

/**
 * @typedef {Object} RemarkMarkmapOptions
 * @property {boolean} [enable=true] 是否启用 Markmap 处理，false 时 markmap 代码块原样交给下游处理
 */

/** @type {RemarkMarkmapOptions} */
const DEFAULT_OPTIONS = {
	enable: true,
};

/**
 * 识别 markdown 源中的 ```markmap``` fenced code block，并在 remark 阶段
 * 将其转换为一个携带 markmap 代码数据属性的自定义节点，供 rehype 阶段渲染。
 *
 * 转换策略：参考 `remark-mermaid.js`，保留 `hChildren`（原始代码作为文本节点）
 * 以兼容 MDX 编译器对 hProperties 的处理。
 *
 * @param {RemarkMarkmapOptions} [options] 插件选项
 * @returns {(tree: import('mdast').Root) => void} remark transformer
 */
export function remarkMarkmap(options = {}) {
	const config = { ...DEFAULT_OPTIONS, ...options };

	return (tree) => {
		if (config.enable === false) {
			return;
		}

		visit(tree, "code", (node) => {
			const lang = typeof node.lang === "string" ? node.lang.toLowerCase() : "";
			if (lang !== "markmap") {
				return;
			}

			const code = typeof node.value === "string" ? node.value : "";
			if (!code.trim()) {
				return;
			}

			node.type = "markmap";
			node.data = {
				hName: "div",
				hProperties: {
					className: ["markmap-container"],
					"data-markmap-code": code,
				},
				// MDX 兼容：将代码存为子节点，防止 MDX 编译器丢失 hProperties
				hChildren: [{ type: "text", value: code }],
			};
			// 清除 value，避免 remark-rehype 将其当作纯文本处理
			node.value = undefined;
		});
	};
}

export default remarkMarkmap;
