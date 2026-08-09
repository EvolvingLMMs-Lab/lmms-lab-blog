interface PixelShapeProps {
	shape?: "square" | "diamond" | "cross" | "triangle";
	size?: number;
	className?: string;
}

export function PixelShape({
	shape = "square",
	size = 8,
	className = "",
}: PixelShapeProps) {
	const pixel = size / 4;

	const shapes: Record<string, React.ReactNode> = {
		square: (
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				fill="currentColor"
			>
				<rect width={size} height={size} />
			</svg>
		),
		diamond: (
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				fill="currentColor"
			>
				<polygon
					points={`${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}`}
				/>
			</svg>
		),
		cross: (
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				fill="currentColor"
			>
				<rect x={pixel} y={0} width={pixel * 2} height={size} />
				<rect x={0} y={pixel} width={size} height={pixel * 2} />
			</svg>
		),
		triangle: (
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				fill="currentColor"
			>
				<polygon points={`${size / 2},0 ${size},${size} 0,${size}`} />
			</svg>
		),
	};

	return (
		<span className={className} style={{ display: "inline-block" }}>
			{shapes[shape]}
		</span>
	);
}
