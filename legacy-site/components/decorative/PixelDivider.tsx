interface PixelDividerProps {
	variant?: "dashed" | "dotted" | "wave" | "zigzag";
	spacing?: "sm" | "md" | "lg";
}

export function PixelDivider({
	variant = "dashed",
	spacing = "md",
}: PixelDividerProps) {
	const spacingValues = {
		sm: "var(--space-md)",
		md: "var(--space-lg)",
		lg: "var(--space-xl)",
	};

	const patterns: Record<string, React.ReactNode> = {
		dashed: (
			<svg width="100%" height="4" preserveAspectRatio="none">
				<pattern id="dash" width="16" height="4" patternUnits="userSpaceOnUse">
					<rect width="8" height="4" fill="currentColor" />
				</pattern>
				<rect width="100%" height="4" fill="url(#dash)" />
			</svg>
		),
		dotted: (
			<svg width="100%" height="4" preserveAspectRatio="none">
				<pattern id="dot" width="8" height="4" patternUnits="userSpaceOnUse">
					<circle cx="2" cy="2" r="2" fill="currentColor" />
				</pattern>
				<rect width="100%" height="4" fill="url(#dot)" />
			</svg>
		),
		wave: (
			<svg width="100%" height="8" preserveAspectRatio="none">
				<pattern id="wave" width="16" height="8" patternUnits="userSpaceOnUse">
					<path
						d="M0,4 Q4,0 8,4 Q12,8 16,4"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					/>
				</pattern>
				<rect width="100%" height="8" fill="url(#wave)" />
			</svg>
		),
		zigzag: (
			<svg width="100%" height="8" preserveAspectRatio="none">
				<pattern
					id="zigzag"
					width="16"
					height="8"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M0,8 L8,0 L16,8"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					/>
				</pattern>
				<rect width="100%" height="8" fill="url(#zigzag)" />
			</svg>
		),
	};

	return (
		<div
			style={{
				margin: `${spacingValues[spacing]} 0`,
				opacity: 0.4,
			}}
			role="separator"
			aria-hidden="true"
		>
			{patterns[variant]}
		</div>
	);
}
