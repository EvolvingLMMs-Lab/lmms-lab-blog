import { MDXRemoteWrapper } from "@/components/mdx/MDXRemoteWrapper";
import { getAllNotes, getNoteBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
	const notes = getAllNotes();
	return notes.map((note) => ({
		slug: note.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const note = getNoteBySlug(slug);
	if (!note) {
		return {
			title: "Note Not Found",
			alternates: {
				canonical: "/notes/",
			},
		};
	}

	return {
		title: `${note.title} - LMMs-Lab`,
		description: note.description,
		alternates: {
			canonical: `/notes/${slug}/`,
		},
	};
}

export default async function NotePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const note = getNoteBySlug(slug);

	if (!note) {
		notFound();
	}

	return (
		<div className="blog-content-wrapper">
			<div className="blog-layout blog-layout-single">
				<main className="blog-main">
					<article className="blog-article">
						<header className="blog-header-grid">
							<div className="blog-header-meta">
								<div className="blog-meta-group">
									<time className="blog-date">
										{new Date(note.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										}).toUpperCase()}
									</time>
								</div>

								{note.tags && note.tags.length > 0 && (
									<div className="blog-meta-group">
										<span className="opacity-50 mx-2">/</span>
										<div className="blog-main-tags">
											{note.tags.map((tag) => (
												<span key={tag} className="blog-main-tag">{tag}</span>
											))}
										</div>
									</div>
								)}
							</div>

							<div className="blog-header-main">
								<h1 className="blog-title">{note.title}</h1>

								{note.description && (
									<p className="blog-description">{note.description}</p>
								)}
							</div>
						</header>

						<div className="blog-prose">
							<MDXRemoteWrapper source={note.content} />
						</div>
					</article>
				</main>
			</div>
		</div>
	);
}
