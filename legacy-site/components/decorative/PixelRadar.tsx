"use client";

interface PixelRadarProps {
	values: number[];
	labels?: string[];
	size?: number;
	showLabels?: boolean;
}

export function PixelRadar({
	values,
	labels,
	size = 200,
	showLabels = true,
}: PixelRadarProps) {
	const numPoints = values.length;
	const angleStep = (2 * Math.PI) / numPoints;
	const centerX = size / 2;
	const centerY = size / 2;
	const radius = size * 0.35;
	const labelRadius = size * 0.45;

	const normalizedValues = values.map((v) => Math.min(1, Math.max(0, v)));

	const pointsStr = normalizedValues
		.map((v, i) => {
			const angle = angleStep * i - Math.PI / 2;
			const x = centerX + Math.cos(angle) * radius * v;
			const y = centerY + Math.sin(angle) * radius * v;
			return `${x},${y}`;
		})
		.join(" ");

	const gridLines = [0.25, 0.5, 0.75, 1].map((level) => {
		const points = Array.from({ length: numPoints })
			.map((_, i) => {
				const angle = angleStep * i - Math.PI / 2;
				const x = centerX + Math.cos(angle) * radius * level;
				const y = centerY + Math.sin(angle) * radius * level;
				return `${x},${y}`;
			})
			.join(" ");
		return points;
	});

	const axisLines = Array.from({ length: numPoints }).map((_, i) => {
		const angle = angleStep * i - Math.PI / 2;
		const x = centerX + Math.cos(angle) * radius;
		const y = centerY + Math.sin(angle) * radius;
		return { x1: centerX, y1: centerY, x2: x, y2: y };
	});

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			style={{ display: "block", margin: "0 auto" }}
		>
			{gridLines.map((points, i) => (
				<polygon
					key={i}
					points={points}
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					opacity={0.2}
				/>
			))}

			{axisLines.map((line, i) => (
				<line
					key={i}
					x1={line.x1}
					y1={line.y1}
					x2={line.x2}
					y2={line.y2}
					stroke="currentColor"
					strokeWidth="1"
					opacity={0.2}
				/>
			))}

			<polygon
				points={pointsStr}
				fill="currentColor"
				fillOpacity={0.3}
				stroke="currentColor"
				strokeWidth="2"
			/>

			{normalizedValues.map((v, i) => {
				const angle = angleStep * i - Math.PI / 2;
				const x = centerX + Math.cos(angle) * radius * v;
				const y = centerY + Math.sin(angle) * radius * v;
				return (
					<rect
						key={i}
						x={x - 3}
						y={y - 3}
						width={6}
						height={6}
						fill="currentColor"
					/>
				);
			})}

			{showLabels &&
				labels?.map((label, i) => {
					const angle = angleStep * i - Math.PI / 2;
					const x = centerX + Math.cos(angle) * labelRadius;
					const y = centerY + Math.sin(angle) * labelRadius;
					return (
						<text
							key={i}
							x={x}
							y={y}
							textAnchor="middle"
							dominantBaseline="middle"
							fill="currentColor"
							fontSize="10"
							fontFamily="var(--font-mono)"
						>
							{label}
						</text>
					);
				})}
		</svg>
	);
}
