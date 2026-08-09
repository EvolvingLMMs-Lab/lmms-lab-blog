"use client";

import { useEffect, useState, useRef } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
	headings: TocItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-80px 0px -80% 0px",
				threshold: 0,
			}
		);

		headings.forEach(({ id }) => {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		});

		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav className="toc" aria-label="Table of contents">
			<div className="toc-title">On this page</div>
			<ul className="toc-list">
				{headings.map((heading) => (
					<li
						key={heading.id}
						className={`toc-item toc-level-${heading.level}`}
						data-active={activeId === heading.id}
					>
						<a href={`#${heading.id}`} className="toc-link">
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

// Mobile ToC - Collapsible drawer at top of article
export function MobileTableOfContents({ headings }: TableOfContentsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeId, setActiveId] = useState<string>("");
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-80px 0px -80% 0px",
				threshold: 0,
			}
		);

		headings.forEach(({ id }) => {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		});

		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	const handleLinkClick = () => {
		setIsOpen(false);
	};

	return (
		<div className="mobile-toc">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="mobile-toc-toggle"
				aria-expanded={isOpen}
				aria-controls="mobile-toc-content"
			>
				<span className="mobile-toc-toggle-text">
					<svg 
						width="18" 
						height="18" 
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor" 
						strokeWidth="2"
						aria-hidden="true"
					>
						<path d="M4 6h16M4 12h16M4 18h10" />
					</svg>
					On this page
				</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`mobile-toc-chevron ${isOpen ? "open" : ""}`}
					aria-hidden="true"
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
			<div
				id="mobile-toc-content"
				ref={contentRef}
				className={`mobile-toc-content ${isOpen ? "open" : ""}`}
				style={{
					maxHeight: isOpen ? `${contentRef.current?.scrollHeight || 400}px` : "0px",
				}}
			>
				<ul className="mobile-toc-list">
					{headings.map((heading) => (
						<li
							key={heading.id}
							className={`mobile-toc-item mobile-toc-level-${heading.level}`}
							data-active={activeId === heading.id}
						>
							<a 
								href={`#${heading.id}`} 
								className="mobile-toc-link"
								onClick={handleLinkClick}
							>
								{heading.text}
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
