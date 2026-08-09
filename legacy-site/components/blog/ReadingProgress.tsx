"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const updateProgress = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
			setProgress(Math.min(100, Math.max(0, scrollPercent)));
		};

		window.addEventListener("scroll", updateProgress, { passive: true });
		updateProgress();

		return () => window.removeEventListener("scroll", updateProgress);
	}, []);

	return (
		<div className="reading-progress">
			<div className="reading-progress-bar" style={{ width: `${progress}%` }} />
		</div>
	);
}
