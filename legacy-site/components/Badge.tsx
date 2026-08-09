import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

export default function Badge({ variant = "default", style, children, ...props }: BadgeProps) {
	const baseStyle: React.CSSProperties = {
		display: "inline-flex",
		alignItems: "center",
		padding: "0.375em 0.75em",
		fontSize: "var(--text-caption)",
		fontWeight: 600,
		lineHeight: 1.2,
		textTransform: "uppercase",
		letterSpacing: "0.06em",
		borderRadius: "2px",
		whiteSpace: "nowrap",
	};

	const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
		default: {
			backgroundColor: "var(--color-fg)",
			color: "var(--color-bg)",
		},
		outline: {
			backgroundColor: "rgba(254, 215, 170, 0.08)",
			color: "inherit",
			boxShadow: "inset 0 0 0 1.5px currentColor",
		},
	};

	return (
		<span
			style={{
				...baseStyle,
				...variantStyles[variant],
				...style,
			}}
			{...props}
		>
			{children}
		</span>
	);
}
