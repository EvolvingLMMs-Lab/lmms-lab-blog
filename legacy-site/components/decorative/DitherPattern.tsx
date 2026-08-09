"use client";

interface DitherPatternProps {
	variant?: "dots" | "lines" | "checker" | "noise" | "scanlines" | "crosshatch" | "glitch";
	size?: "sm" | "md" | "lg";
	opacity?: number;
	className?: string;
	animated?: boolean;
}

const patterns = {
	dots: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23fed7aa'/%3E%3C/svg%3E")`,
	lines: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L4 4M4 0L0 4' stroke='%23fed7aa' stroke-width='0.5'/%3E%3C/svg%3E")`,
	checker: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='2' height='2' fill='%23fed7aa'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23fed7aa'/%3E%3C/svg%3E")`,
	noise: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='3' y='1' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='6' y='0' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='1' y='3' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='4' y='4' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='7' y='3' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='2' y='6' width='1' height='1' fill='%23fed7aa'/%3E%3Crect x='5' y='7' width='1' height='1' fill='%23fed7aa'/%3E%3C/svg%3E")`,
	scanlines: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='0.5' x2='4' y2='0.5' stroke='%23fed7aa' stroke-width='1'/%3E%3Cline x1='0' y1='2.5' x2='4' y2='2.5' stroke='%23fed7aa' stroke-width='0.5'/%3E%3C/svg%3E")`,
	crosshatch: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 2L6 6M6 2L2 6' stroke='%23fed7aa' stroke-width='0.8'/%3E%3C/svg%3E")`,
	glitch: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='3' width='16' height='1' fill='%23fed7aa' opacity='0.3'/%3E%3Crect x='0' y='8' width='16' height='2' fill='%23fed7aa' opacity='0.2'/%3E%3Crect x='0' y='13' width='16' height='1' fill='%23fed7aa' opacity='0.4'/%3E%3Crect x='2' y='0' width='1' height='16' fill='%23fed7aa' opacity='0.15'/%3E%3Crect x='9' y='0' width='2' height='16' fill='%23fed7aa' opacity='0.1'/%3E%3C/svg%3E")`,
};

const sizes = {
	sm: "4px",
	md: "8px",
	lg: "16px",
};

export function DitherPattern({
	variant = "dots",
	size = "md",
	opacity = 0.3,
	className = "",
	animated = false,
}: DitherPatternProps) {
	const animationClass = animated ? `dither-${variant}-animate` : "";
	
	return (
		<div
			className={`${className} ${animationClass}`}
			style={{
				position: "absolute",
				inset: 0,
				backgroundImage: patterns[variant],
				backgroundSize: sizes[size],
				opacity,
				pointerEvents: "none",
			}}
			aria-hidden="true"
		/>
	);
}

export function ConcentricOverlay({ 
	opacity = 0.3, 
	className = "",
	animated = true,
}: { 
	opacity?: number; 
	className?: string;
	animated?: boolean;
}) {
	return (
		<svg 
			className={`concentric-overlay ${className} ${animated ? "concentric-animate" : ""}`}
			viewBox="0 0 100 100" 
			preserveAspectRatio="xMidYMid slice"
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				opacity,
			}}
			aria-hidden="true"
		>
			{Array.from({ length: 25 }, (_, i) => (
				<circle
					key={i}
					cx="50"
					cy="50"
					r={(i + 1) * 4}
					fill="none"
					stroke="currentColor"
					strokeWidth={i % 3 === 0 ? 1 : 0.5}
					opacity={0.2 + (1 - i / 25) * 0.4}
				/>
			))}
		</svg>
	);
}

export function GrainOverlay({
	opacity = 0.15,
	className = "",
}: {
	opacity?: number;
	className?: string;
}) {
	return (
		<div
			className={`grain-overlay ${className}`}
			style={{
				position: "absolute",
				inset: 0,
				backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				opacity,
				pointerEvents: "none",
				mixBlendMode: "overlay",
			}}
			aria-hidden="true"
		/>
	);
}
