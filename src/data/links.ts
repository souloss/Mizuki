/**
 * Links data for sites directive.
 * Groups of site items referenced by :::sites{group="groupName"}
 */

interface SiteItem {
	title: string;
	url: string;
	description?: string;
	icon?: string;
	cover?: string;
	labels?: { name: string; color?: string }[];
}

interface SiteGroup {
	name: string;
	links: SiteItem[];
}

const linksData: Record<string, SiteItem[]> = {};

// Build a group-name -> items map from the groups array
const groups: SiteGroup[] = [
	{
		name: "design",
		links: [
			{
				title: "Dribbble",
				url: "https://dribbble.com",
				description: "Discover the world's top designers & creatives",
				icon: "https://cdn.simpleicons.org/dribbble/EA4C89",
				labels: [{ name: "Design", color: "#ea4c89" }],
			},
			{
				title: "Behance",
				url: "https://www.behance.net",
				description: "Where the world designs",
				icon: "https://cdn.simpleicons.org/behance/1769FF",
				labels: [{ name: "Creative", color: "#1769ff" }],
			},
			{
				title: "Awwwards",
				url: "https://www.awwwards.com",
				description: "The awards of design, creativity and innovation",
				icon: "https://cdn.simpleicons.org/awwwards/2B3340",
				labels: [{ name: "Awards", color: "#2b3340" }],
			},
		],
	},
	{
		name: "friends",
		links: [
			{
				title: "Astro",
				url: "https://astro.build",
				description: "The web framework for content-driven websites",
				icon: "https://astro.build/favicon.ico",
				labels: [{ name: "Framework", color: "#FF5D01" }],
			},
			{
				title: "Vercel",
				url: "https://vercel.com",
				description: "Develop. Preview. Ship.",
				icon: "https://vercel.com/favicon.ico",
				labels: [{ name: "Hosting", color: "#000000" }],
			},
			{
				title: "Tailwind CSS",
				url: "https://tailwindcss.com",
				description:
					"A utility-first CSS framework for rapidly building custom designs",
				icon: "https://tailwindcss.com/favicon.ico",
				labels: [{ name: "CSS", color: "#06b6d4" }],
			},
		],
	},
];

for (const group of groups) {
	linksData[group.name] = group.links;
}

export const links = linksData;
