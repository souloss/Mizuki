import { removeFileExtension } from "@utils/url-utils"
import { getCollection } from "astro:content"

export interface SeriesInfo {
	name: string
	posts: {
		title: string
		id: string
		permalink: string | undefined
		slug: string | undefined
		filePath: string | undefined
		published: Date
		seriesOrder: number
	}[]
}

export interface SeriesNavigation {
	prev: SeriesInfo["posts"][number] | null
	next: SeriesInfo["posts"][number] | null
	currentIndex: number
	total: number
}

export async function getSeriesData(seriesName: string): Promise<SeriesInfo | null> {
	const allPosts = await getCollection("posts", ({ data }) => {
		return !data.draft && data.series === seriesName
	})

	if (allPosts.length === 0) {return null}

	const posts = allPosts
		.map((post) => ({
			title: post.data.title,
			id: post.id,
			permalink: post.data.permalink || undefined,
			slug: post.data.slug || undefined,
			filePath: post.filePath || undefined,
			published: post.data.published,
			seriesOrder: post.data.seriesOrder ?? 0,
		}))
		.sort((a, b) => a.seriesOrder - b.seriesOrder || a.published.getTime() - b.published.getTime())

	return { name: seriesName, posts }
}

export async function getAllSeries(): Promise<SeriesInfo[]> {
	const allPosts = await getCollection("posts", ({ data }) => !data.draft && data.series)

	const seriesMap = new Map<string, SeriesInfo["posts"]>()

	for (const post of allPosts) {
		const seriesName = post.data.series!
		if (!seriesMap.has(seriesName)) {
			seriesMap.set(seriesName, [])
		}
		seriesMap.get(seriesName)!.push({
			title: post.data.title,
			id: post.id,
			permalink: post.data.permalink || undefined,
			slug: post.data.slug || undefined,
			filePath: post.filePath || undefined,
			published: post.data.published,
			seriesOrder: post.data.seriesOrder ?? 0,
		})
	}

	return Array.from(seriesMap.entries())
		.map(([name, posts]) => ({
			name,
			posts: posts.sort(
				(a, b) => a.seriesOrder - b.seriesOrder || a.published.getTime() - b.published.getTime(),
			),
		}))
		.sort((a, b) => a.posts[0].published.getTime() - b.posts[0].published.getTime())
}

export function getSeriesNavigation(seriesInfo: SeriesInfo, currentSlug: string): SeriesNavigation | null {
	const currentIndex = seriesInfo.posts.findIndex(
		(p) => p.permalink === currentSlug || p.id === currentSlug || removeFileExtension(p.id) === currentSlug,
	)

	if (currentIndex === -1) {return null}

	return {
		prev: currentIndex > 0 ? seriesInfo.posts[currentIndex - 1] : null,
		next: currentIndex < seriesInfo.posts.length - 1 ? seriesInfo.posts[currentIndex + 1] : null,
		currentIndex: currentIndex + 1,
		total: seriesInfo.posts.length,
	}
}
