"use client";

import { useState, useEffect } from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import { DiffusionText } from "@/components/motion/DiffusionText";
import { useTransition } from "@/components/motion/TransitionSystem";
import { HackerTerminal } from "./HackerTerminal";

const HERO_PHRASES = [
	{
		en: "Building",
		zh: ["构建", "建造", "筑基"],
		ja: ["構築", "ビルド", "構成"],
	},
	{
		en: "Feeling",
		zh: ["感受", "感知", "体悟"],
		ja: ["感じる", "感知", "知覚"],
	},
	{
		en: "Paving",
		zh: ["铺路", "开拓", "探求"],
		ja: ["道を拓く", "開拓", "探求"],
	},
] as const;

const HERO_MORPH_LEXICON = HERO_PHRASES.reduce(
	(acc, phrase) => {
		acc[phrase.en] = {
			zh: [...phrase.zh],
			ja: [...phrase.ja],
		};
		return acc;
	},
	{} as Record<string, { zh: string[]; ja: string[] }>,
);

export function HeroSection() {
	const { phase } = useTransition();
	const transitioning = phase !== "idle";

	const [phraseIndex, setPhraseIndex] = useState(0);
	
	useEffect(() => {
		if (transitioning) return;
		const interval = setInterval(() => {
			setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
		}, 9600);
		return () => clearInterval(interval);
	}, [transitioning]);

	const displayText = HERO_PHRASES[phraseIndex].en;
	const showSubtitle = phraseIndex === 2;

	return (
		<div className="relative w-full overflow-hidden bg-[var(--background)]">
			<section className="brutalist-hero dashboard-hero">
			<div className="dashboard-panel hero-panel">
				
					<div className="brutalist-hero-content">
						<h1 className="brutalist-hero-title fade-in-up animate-fill-both">
							<div className="min-h-[1.2em] overflow-hidden" style={{ whiteSpace: "nowrap" }}>
										<DiffusionText 
											text={displayText}
											revealSpeed={2400} 
											variant="morph"
											paused={transitioning}
											morphLexicon={HERO_MORPH_LEXICON}
										/>
							</div>
							<span
								className={`brutalist-hero-title-sub lowercase ${
									showSubtitle ? '' : 'hidden-sub'
								}`}
							>
								the way to multimodal intelligence.
							</span>
						</h1>
						
						<p className="brutalist-hero-subtitle fade-in-up animate-fill-both stagger-1">
							Open research on multimodal models, evaluation, benchmarks, and lmms-eval tooling - shared as we discover.
						</p>

						<div className="brutalist-hero-cta fade-in-up animate-fill-both stagger-2">
							<TransitionLink href="/posts" className="brutalist-btn-primary">
								Explore Research
							</TransitionLink>
							<TransitionLink href="/about" className="brutalist-btn-secondary">
								About the Lab
							</TransitionLink>
						</div>
					</div>
				</div>

			<div className="dashboard-panel hero-panel hero-panel-visual">
				
				<div className="brutalist-hero-visual fade-in animate-fill-both stagger-2">
					<div className="hero-terminal-shell">
						<HackerTerminal />
					</div>
				</div>
				</div>
			</section>
		</div>
	);
}
