"use client";

import { useState } from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import styles from "./ArchiveList.module.css";

interface ArchiveEntry {
	slug: string;
	href?: string;
	title: string;
	description?: string;
	date: string;
	tags?: string[];
}

interface ArchiveListProps {
	entries: ArchiveEntry[];
	basePath: string;
	label: string;
	sysPath: string;
	perPage?: number;
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}.${m}.${day}`;
}

export default function ArchiveList({
	entries,
	basePath,
	label,
	sysPath,
	perPage = 10,
}: ArchiveListProps) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(entries.length / perPage);
	const startIndex = (currentPage - 1) * perPage;
	const currentEntries = entries.slice(startIndex, startIndex + perPage);

	const goToPage = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.headerRow}>
					<span className={styles.title}>{label}</span>
					<div className={styles.headerLine} />
					{entries.length > 0 && (
						<span className={styles.count}>{entries.length} entries</span>
					)}
				</div>
				<p className={styles.subtitle}>{sysPath}</p>
			</header>

			<div className={styles.grid}>
				{currentEntries.length === 0 ? (
					<p className={styles.empty}>&gt; no entries found_</p>
				) : (
					currentEntries.map((entry, i) => {
						const globalIndex = startIndex + i + 1;
						return (
							<TransitionLink
								key={entry.slug}
								href={entry.href ?? `${basePath}/${entry.slug}/`}
								fullDocument={entry.href?.startsWith("/onevision-encoder/")}
								className={styles.entry}
								aria-label={`Read: ${entry.title}`}
							>
								<span className={styles.entryIndex}>
									{String(globalIndex).padStart(2, "0")}
								</span>
								<div className={styles.entryContent}>
									<div className={styles.entryMeta}>
										<time className={styles.entryDate}>
											{formatDate(entry.date)}
										</time>
										{entry.tags && entry.tags.length > 0 && (
											<div className={styles.entryTags}>
												{entry.tags.slice(0, 3).map((tag) => (
													<span key={tag} className={styles.tag}>
														{tag}
													</span>
												))}
											</div>
										)}
									</div>
									<h2 className={styles.entryTitle}>{entry.title}</h2>
									{entry.description && (
										<p className={styles.entryDesc}>{entry.description}</p>
									)}
								</div>
							</TransitionLink>
						);
					})
				)}
			</div>

			{totalPages > 1 && (
				<nav aria-label="Pagination" className={styles.pagination}>
					<button
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						aria-label="Previous page"
						className={styles.pageBtn}
					>
						&lt; prev
					</button>

					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<button
							key={page}
							onClick={() => goToPage(page)}
							aria-label={`Page ${page}`}
							aria-current={currentPage === page ? "page" : undefined}
							className={`${styles.pageNum} ${currentPage === page ? styles.pageNumActive : ""}`}
						>
							{page}
						</button>
					))}

					<button
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						aria-label="Next page"
						className={styles.pageBtn}
					>
						next &gt;
					</button>
				</nav>
			)}
		</div>
	);
}
