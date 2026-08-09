"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

interface PostThumbnailProps {
	title: string;
	seed?: string;
	className?: string;
	variant?: number;
	hideTitle?: boolean;
	thumbnail?: string;
}

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

function fract(x: number): number {
	return x - Math.floor(x);
}

function hash2D(ix: number, iy: number, seed: number): number {
	return fract(Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453);
}

function noise(x: number, y: number, seed: number): number {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const fx = x - ix;
	const fy = y - iy;
	const ux = fx * fx * (3 - 2 * fx);
	const uy = fy * fy * (3 - 2 * fy);
	const a = hash2D(ix, iy, seed);
	const b = hash2D(ix + 1, iy, seed);
	const c = hash2D(ix, iy + 1, seed);
	const d = hash2D(ix + 1, iy + 1, seed);
	return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, seed: number, octaves = 5): number {
	let v = 0,
		a = 0.5,
		f = 1,
		t = 0;
	for (let i = 0; i < octaves; i++) {
		v += noise(x * f, y * f, seed + i * 43.17) * a;
		t += a;
		a *= 0.5;
		f *= 2;
	}
	return v / t;
}

function warpedFbm(
	x: number,
	y: number,
	seed: number,
	octaves = 5,
): number {
	const wx = fbm(x, y, seed + 100, 3) * 0.8;
	const wy = fbm(x, y, seed + 200, 3) * 0.8;
	return fbm(x + wx, y + wy, seed, octaves);
}

type SceneFn = (nx: number, ny: number) => number;

function ridgeScene(seed: number): SceneFn {
	const ox = hash2D(seed, 0, 0) * 100;
	return (nx, ny) => {
		let b = 0.65 - ny * 0.15;
		b +=
			warpedFbm(nx * 4 + ox, ny * 6, seed, 5) *
			0.25 *
			Math.max(0, 1 - ny * 2.5);

		for (let i = 0; i < 4; i++) {
			const depth = i / 4;
			const base = 0.3 + depth * 0.2;
			const h =
				base +
				fbm(nx * (4 + i * 2) + ox + i * 30, 0.5, seed + i * 71, 5) *
					0.15;
			if (ny > h) {
				const detail = fbm(
					nx * 12 + i * 50,
					ny * 12,
					seed + i * 131,
					4,
				);
				b = 0.3 - depth * 0.2 + detail * 0.08;
			}
		}
		return Math.max(0.02, Math.min(0.98, b));
	};
}

function burstScene(seed: number): SceneFn {
	const cx = 0.42 + hash2D(seed, 0, 0) * 0.16;
	const cy = 0.52 + hash2D(seed, 1, 0) * 0.18;
	const ox = hash2D(seed, 2, 0) * 100;
	return (nx, ny) => {
		const dx = nx - cx;
		const dy = (ny - cy) * 1.5;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const angle = Math.atan2(dy, dx);

		const core = Math.exp(-dist * dist * 50);
		const glow = Math.exp(-dist * dist * 5) * 0.7;
		const beam =
			Math.abs(nx - cx) < 0.06 && ny < cy
				? Math.exp(-(cy - ny) * 4) *
					0.4 *
					(1 - Math.abs(nx - cx) / 0.06)
				: 0;
		const rays =
			Math.pow(Math.abs(Math.cos(angle * 7 + ox)), 10) *
			Math.exp(-dist * 3) *
			0.25;
		const smoke = warpedFbm(nx * 5 + ox, ny * 5, seed, 5);
		const ring =
			Math.exp(-Math.pow(dist - 0.3, 2) * 12) * smoke * 0.6;
		const ground =
			ny > 0.82
				? Math.exp(-(nx - cx) * (nx - cx) * 8) *
					(1 - (ny - 0.82) * 4) *
					0.25
				: 0;

		return Math.max(
			0.02,
			Math.min(0.98, 0.04 + core + glow + beam + rays + ring + ground),
		);
	};
}

function cloudScene(seed: number): SceneFn {
	const ox = hash2D(seed, 0, 0) * 100;
	const oy = hash2D(seed, 1, 0) * 100;
	return (nx, ny) => {
		let b = 0.5 - ny * 0.15;
		const c1 = warpedFbm(nx * 3.5 + ox, ny * 3.5 + oy, seed, 6);
		const c2 = fbm(
			nx * 8 + ox * 0.3,
			ny * 7 + oy * 0.3,
			seed + 41,
			4,
		);
		const mask = Math.max(0, c1 - 0.32) * 3;
		const cloudBright = 0.85 - ny * 0.25 + c2 * 0.25;
		b =
			b * (1 - Math.min(1, mask)) +
			cloudBright * Math.min(1, mask);
		b +=
			Math.max(0, nx * 0.3 + (1 - ny) * 0.2 - 0.25) *
			Math.min(1, mask) *
			0.25;

		if (ny > 0.75) {
			const haze = (ny - 0.75) / 0.25;
			b = b * (1 - haze * 0.4) + 0.35 * haze * 0.4;
		}
		return Math.max(0.04, Math.min(0.96, b));
	};
}

function topoScene(seed: number): SceneFn {
	const ox = hash2D(seed, 0, 0) * 100;
	const oy = hash2D(seed, 1, 0) * 100;
	return (nx, ny) => {
		const terrain = warpedFbm(nx * 4 + ox, ny * 4 + oy, seed, 6);
		const interval = 0.07;
		const distToLine = Math.abs(
			(terrain % interval) - interval * 0.5,
		);
		const line = 1 - Math.min(1, distToLine * 35);
		const bg = terrain * 0.4 + 0.15;
		const b = bg + line * 0.55;
		const grad = 1 - (nx * 0.15 + ny * 0.15);
		return Math.max(0.03, Math.min(0.97, b * grad));
	};
}

function horizonScene(seed: number): SceneFn {
	const ox = hash2D(seed, 0, 0) * 100;
	const hor = 0.45 + hash2D(seed, 1, 0) * 0.1;
	return (nx, ny) => {
		if (ny < hor) {
			let b = 0.55 - ny * 0.3;
			b += warpedFbm(nx * 5 + ox, ny * 8, seed, 6) * 0.3;
			b += Math.exp(-Math.pow(ny - hor, 2) * 100) * 0.3;
			return Math.max(0.04, Math.min(0.96, b));
		} else {
			let b = 0.25;
			b +=
				warpedFbm(
					nx * 5 + ox,
					(hor - (ny - hor)) * 8,
					seed,
					4,
				) * 0.15;
			b += Math.exp(-Math.pow(ny - hor, 2) * 50) * 0.35;
			b +=
				Math.sin(
					ny * 60 + fbm(nx * 10, ny * 2, seed + 50, 3) * 5,
				) * 0.03;
			b *= 1 - (ny - hor) * 0.5;
			return Math.max(0.03, Math.min(0.96, b));
		}
	};
}

const SCENES = [
	ridgeScene,
	burstScene,
	cloudScene,
	topoScene,
	horizonScene,
];

const DOT = 4;
const R_MAX = DOT * 0.47;
const BG_COLOR = "#f0e6d0";
const DOT_COLOR = "#12151c";

function renderHalftone(
	canvas: HTMLCanvasElement,
	w: number,
	h: number,
	hash: number,
	variant: number,
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0, 0, w, h);

	const scene = SCENES[variant % SCENES.length](hash);
	const cols = Math.ceil(w / DOT);
	const rows = Math.ceil(h / DOT);

	ctx.fillStyle = DOT_COLOR;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const px = c * DOT + DOT / 2;
			const py = r * DOT + DOT / 2;
			const raw = scene(px / w, py / h);
			const brightness = Math.min(1, raw * 1.3 + 0.08);
			const radius = (1 - brightness) * R_MAX;
			if (radius > 0.3) {
				ctx.beginPath();
				ctx.arc(px, py, radius, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
}

const CW = 480;
const CH = 480;

export function PostThumbnail({
	title,
	seed,
	className = "",
	variant: forcedVariant,
	hideTitle = false,
	thumbnail,
}: PostThumbnailProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const hash = useMemo(() => hashString(seed || title), [seed, title]);
	const variant =
		forcedVariant !== undefined ? forcedVariant : hash % SCENES.length;

	useEffect(() => {
		if (thumbnail) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		renderHalftone(canvas, CW, CH, hash, variant);
	}, [hash, variant, thumbnail]);

	if (thumbnail) {
		return (
			<div className={`post-thumbnail-v2 ${className}`}>
				<div className="post-thumbnail-v2-bg">
					<Image
						src={thumbnail}
						alt={title}
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						style={{ objectFit: "cover" }}
					/>
				</div>
				{!hideTitle && (
					<>
						<div className="post-thumbnail-v2-overlay" />
						<div className="post-thumbnail-v2-content">
							<span className="post-thumbnail-v2-title">
								{title.length > 40
									? title.slice(0, 37) + "..."
									: title}
							</span>
						</div>
					</>
				)}
			</div>
		);
	}

	return (
		<div className={`post-thumbnail-v2 ${className}`}>
			<div className="post-thumbnail-v2-bg">
				<canvas
					ref={canvasRef}
					width={CW}
					height={CH}
					style={{
						width: "100%",
						height: "100%",
						display: "block",
					}}
				/>
			</div>
			{!hideTitle && (
				<>
					<div className="post-thumbnail-v2-overlay" />
					<div className="post-thumbnail-v2-content">
						<span className="post-thumbnail-v2-title">
							{title.length > 40
								? title.slice(0, 37) + "..."
								: title}
						</span>
					</div>
				</>
			)}
		</div>
	);
}
