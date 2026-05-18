import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const postsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		pinned: z.boolean().optional().default(false),
		comment: z.boolean().optional().default(true),
		priority: z.number().optional(),
		author: z.string().optional().default(""),
		sourceLink: z.string().optional().default(""),
		licenseName: z.string().optional().default(""),
		licenseUrl: z.string().optional().default(""),

		/* Page encryption fields */
		encrypted: z.boolean().optional().default(false),
		password: z.string().optional().default(""),
		passwordHint: z.string().optional().default(""),
		hideHomeContent: z.boolean().optional(),

		/* Posts alias */
		alias: z.string().optional(),

		/* Custom permalink - 自定义固定链接，优先级高于 alias */
		permalink: z.string().optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
	schema: z.object({}),
});
const docsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
	schema: z.object({
		title: z.string().optional(),
		createTime: z.union([z.string(), z.date()]).optional(),
		permalink: z.string().optional(),
		copyright: z.unknown().optional(),
		order: z.number().optional().default(0),
		section: z.string().optional(),
		docSlug: z.string().optional(),
		lang: z.string().optional().default(""),
		description: z.string().optional().default(""),
		isHomepage: z.boolean().optional().default(false),
		icon: z.string().optional(),
		badge: z
			.object({
				type: z
					.enum(["info", "warning", "danger", "tip", "new", "recommended", "not-recommended", "v2", "v3", "v4"])
					.default("info"),
				text: z.string(),
			})
			.optional(),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	docs: docsCollection,
};
