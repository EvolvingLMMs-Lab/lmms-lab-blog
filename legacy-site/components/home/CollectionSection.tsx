"use client";

import { TechContainer } from "@/components/decorative";
import { PostThumbnail } from "@/components/blog/PostThumbnail";
import TransitionLink from "@/components/motion/TransitionLink";
import { getPostHref } from "@/lib/links";
import type { Post } from "@/lib/posts";

interface CollectionSectionProps {
	posts: Post[];
}

export function CollectionSection({ posts }: CollectionSectionProps) {
	return (
		<section className="museum-collection dashboard-surface">
			<div className="museum-section-header">
				<span className="museum-section-label">Latest Publications</span>
				<div className="museum-section-line" />
				<TransitionLink href="/posts" className="museum-view-all">
					View Archive
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</TransitionLink>
			</div>

			<div className="museum-grid">
				{posts.map((post, index) => (
					<TransitionLink 
						key={post.slug} 
						href={getPostHref(post.slug)} 
						className="museum-card card-lift"
						aria-label={`Read article: ${post.title}`}
					>
						<TechContainer className="h-full flex flex-col p-0! border-none!" label={`[${String(index + 1).padStart(2, '0')}]`}>
							<div className="museum-card-image">
								<PostThumbnail title={post.title} seed={post.slug} variant={index % 5} thumbnail={post.thumbnail} />
							</div>
							<div className="museum-card-content">
								<time className="museum-card-date">
									{new Date(post.date).toLocaleDateString("en-US", {
										month: "short",
										year: "numeric",
									}).toUpperCase()}
								</time>
								<h3 className="museum-card-title">{post.title}</h3>
								{post.mainTags?.[0] && (
									<span className="museum-card-tag">{post.mainTags[0]}</span>
								)}
							</div>
						</TechContainer>
					</TransitionLink>
				))}
			</div>
		</section>
	);
}
