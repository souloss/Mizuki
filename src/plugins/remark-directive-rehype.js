import { h } from "hastscript";
import { visit } from "unist-util-visit";

// Directives handled by remark-content-directives.mjs — skip here to avoid interference
const CONTENT_DIRECTIVE_NAMES = new Set([
	// Text (inline) directives
	"mark",
	"kbd",
	"blur",
	"psw",
	"u",
	"wavy",
	"emp",
	"del",
	"hashtag",
	"button",
	"btn",
	"color",
	"sup",
	"sub",
	"checkbox",
	"radio",
	"step-brackets",
	"emoji",
	// Leaf directives
	"asciinema",
	"colors",
	"image",
	// Container directives
	"callout",
	"note",
	"info",
	"tip",
	"warning",
	"caution",
	"important",
	"question",
	"quote",
	"bug",
	"example",
	"success",
	"failure",
	"danger",
	"folding",
	"collapse",
	"folders",
	"timeline",
	"tabs",
	"poetry",
	"copy",
	"grid",
	"panel",
	"blockquote",
	"quot",
	"reel",
	"paper",
	"video",
	"audio",
	"gallery",
	"asciinema",
	"colors",
	"private",
	"ghcard",
	"sites",
	"card",
	"banner",
	"yoicard",
	"link-card",
	"link",
	// Alignment aliases
	"left",
	"center",
	"right",
]);

export function parseDirectiveNode() {
	return (tree) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				// Skip directives handled by remark-content-directives
				if (
					CONTENT_DIRECTIVE_NAMES.has(node.name) ||
					node.name === "__md_element__"
				) {
					return;
				}

				// biome-ignore lint/suspicious/noAssignInExpressions: <check later>
				const data = node.data || (node.data = {});
				node.attributes = node.attributes || {};
				if (
					node.children.length > 0 &&
					node.children[0].data &&
					node.children[0].data.directiveLabel
				) {
					// Add a flag to the node to indicate that it has a directive label
					node.attributes["has-directive-label"] = true;
				}
				const hast = h(node.name, node.attributes);

				data.hName = hast.tagName;
				data.hProperties = hast.properties;
			}
		});
	};
}
