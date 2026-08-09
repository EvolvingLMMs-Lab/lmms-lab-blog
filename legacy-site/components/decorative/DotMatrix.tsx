"use client";

interface DotMatrixProps {
	rows?: number;
	cols?: number;
	className?: string;
}

export function DotMatrix({
	rows = 8,
	cols = 8,
	className = "",
}: DotMatrixProps) {
	const dots = Array.from({ length: rows * cols }, (_, i) => ({
		row: Math.floor(i / cols),
		col: i % cols,
	}));

	return (
		<div className={`dot-matrix-3d ${className}`} aria-hidden="true">
			<div 
				className="dot-matrix-grid"
				style={{
					"--rows": rows,
					"--cols": cols,
				} as React.CSSProperties}
			>
				{dots.map((dot, i) => (
					<div
						key={i}
						className="dot-matrix-dot"
						style={{
							"--row": dot.row,
							"--col": dot.col,
							animationDelay: `${(dot.row + dot.col) * 150}ms`,
						} as React.CSSProperties}
					/>
				))}
			</div>
		</div>
	);
}
