export interface ArchivePanelProps {
	sortedPosts: Post[];
}

export interface Post {
	id: string;
	url?: string;
	data: {
		title: string;
		tags: string[];
		category?: string;
		published: Date;
		alias?: string;
		permalink?: string;
	};
}
