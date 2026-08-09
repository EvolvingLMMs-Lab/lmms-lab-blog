"use client";

import ArchiveList from "@/components/ArchiveList";
import { getPostHref } from "@/lib/links";

interface Post {
	slug: string;
	title: string;
	description?: string;
	date: string;
	tags?: string[];
}

interface PostsClientProps {
	posts: Post[];
}

export function PostsClient({ posts }: PostsClientProps) {
	return (
		<ArchiveList
			entries={posts.map((post) => ({
				...post,
				href: getPostHref(post.slug),
			}))}
			basePath="/posts"
			label="Archive"
			sysPath="SYS://research/publications - index"
		/>
	);
}
