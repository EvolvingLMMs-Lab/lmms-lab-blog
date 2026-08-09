"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = "default", size = "md", style, children, ...props }, ref) => {
		const baseStyle: React.CSSProperties = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "var(--space-sm)",
			fontFamily: "inherit",
			fontWeight: 500,
			cursor: "pointer",
			textDecoration: "none",
			border: "none",
			borderRadius: 0,
		};

		const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
			default: {
				backgroundColor: "var(--color-fg)",
				color: "var(--color-bg)",
				boxShadow: "0 0 0 2px var(--color-fg)",
			},
			outline: {
				backgroundColor: "transparent",
				color: "inherit",
				boxShadow: "0 0 0 2px currentColor",
			},
			ghost: {
				backgroundColor: "transparent",
				color: "inherit",
				boxShadow: "none",
			},
		};

		const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
			sm: {
				padding: "var(--space-xs) var(--space-sm)",
				fontSize: "0.875rem",
			},
			md: {
				padding: "var(--space-sm) var(--space-md)",
				fontSize: "1rem",
			},
			lg: {
				padding: "var(--space-md) var(--space-lg)",
				fontSize: "1.125rem",
			},
		};

		return (
			<button
				ref={ref}
				className="interactive focus-ring"
				style={{
					...baseStyle,
					...variantStyles[variant],
					...sizeStyles[size],
					...style,
				}}
				{...props}
			>
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";

export default Button;
