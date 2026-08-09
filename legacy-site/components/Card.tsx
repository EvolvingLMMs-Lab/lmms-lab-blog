"use client";

import type { HTMLAttributes, ReactNode } from "react";
import TransitionLink from "@/components/motion/TransitionLink";

interface CardProps extends HTMLAttributes<HTMLElement> {
	href?: string;
	children: ReactNode;
}

export default function Card({ href, style, children, ...props }: CardProps) {
	const cardStyle: React.CSSProperties = {
		display: "block",
		padding: "var(--space-lg)",
		boxShadow: "0 0 0 2px currentColor",
		textDecoration: "none",
		color: "inherit",
		...style,
	};

	if (href) {
		return (
			<TransitionLink href={href} style={cardStyle} className="card-lift" {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
				{children}
			</TransitionLink>
		);
	}

	return (
		<article style={cardStyle} {...props}>
			{children}
		</article>
	);
}
