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

		/* Posts alias - 别名路径 */
		alias: z.string().optional(),

		/* Custom permalink - 自定义固定链接，优先级高于 alias */
		permalink: z.string().optional(),

		/* Slug - URL 路径中的简短文本标识，只覆盖文件名部分 */
		slug: z.string().optional(),

		/* Series fields - 专栏/系列 */
		series: z.string().optional(),
		seriesOrder: z.number().optional().default(0),

		/* OG description override */
		ogDescription: z.string().optional(),

		/* Redirect URL - 跳转到外部/静态资源页面 */
		redirect: z.string().optional(),

		/* Repost fields - 转载 */
		repost: z.object({
			originalAuthor: z.string(),
			originalUrl: z.string().url(),
			originalTitle: z.string().optional(),
			originalSite: z.string().optional(),
			redirect: z.string().optional(),
		}).optional(),

		/* Copyright license */
		copyright: z.enum([
			"CC BY", "CC BY-SA", "CC BY-ND", "CC BY-NC",
			"CC BY-NC-SA", "CC BY-NC-ND", "CC0", "ARR",
		]).optional(),

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
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
