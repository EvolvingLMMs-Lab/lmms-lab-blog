"use client";

import { mediaUrl } from "@/lib/media";

type PreloadLevel = "warm" | "hot";

const COOKIE_NAME = "ov_encoder_preloaded";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

let didWarm = false;
let didHot = false;

function hasCookie(name: string): boolean {
	if (typeof document === "undefined") return false;
	const needle = `${name}=`;
	return document.cookie.split(";").some((part) => part.trim().startsWith(needle));
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
	if (typeof document === "undefined") return;
	document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function isSaveDataEnabled(): boolean {
	if (typeof navigator === "undefined") return false;
	const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } };
	return Boolean(nav.connection?.saveData);
}

function isSlowConnection(): boolean {
	if (typeof navigator === "undefined") return false;
	const nav = navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } };
	const effectiveType = nav.connection?.effectiveType;
	if (!effectiveType) return false;
	return effectiveType === "slow-2g" || effectiveType === "2g";
}

function isFastEnoughForVideoPrefetch(): boolean {
	if (typeof navigator === "undefined") return false;
	const nav = navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } };
	if (nav.connection?.effectiveType && nav.connection.effectiveType !== "4g") return false;
	if (typeof nav.connection?.downlink === "number" && nav.connection.downlink < 5) return false;
	return true;
}

function addLink(rel: string, href: string, attrs?: Record<string, string>) {
	if (typeof document === "undefined") return;
	const head = document.head;
	if (!head) return;

	const existing = head.querySelector(`link[rel="${rel}"][href="${href}"]`);
	if (existing) return;

	const link = document.createElement("link");
	link.rel = rel;
	link.href = href;
	if (attrs) {
		for (const [k, v] of Object.entries(attrs)) {
			link.setAttribute(k, v);
		}
	}
	head.appendChild(link);
}

function idle(cb: () => void) {
	if (typeof window === "undefined") return;
	const w = window as Window & { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number };
	if (typeof w.requestIdleCallback === "function") {
		w.requestIdleCallback(cb, { timeout: 1500 });
		return;
	}
	setTimeout(cb, 350);
}

function warm() {
	if (didWarm) return;
	didWarm = true;

	// External resources used by the static `/onevision-encoder/` page.
	addLink("dns-prefetch", "https://cdn.tailwindcss.com");
	addLink("preconnect", "https://cdn.tailwindcss.com", { crossorigin: "" });

	addLink("dns-prefetch", "https://cdnjs.cloudflare.com");
	addLink("preconnect", "https://cdnjs.cloudflare.com", { crossorigin: "" });

	addLink("dns-prefetch", "https://fonts.googleapis.com");
	addLink("preconnect", "https://fonts.googleapis.com");
	addLink("dns-prefetch", "https://fonts.gstatic.com");
	addLink("preconnect", "https://fonts.gstatic.com", { crossorigin: "anonymous" });

	// Same-origin assets for the OneVision page.
	// Keep this list intentionally small - the page contains hundreds of patch images.
	addLink("prefetch", "/onevision-encoder/images/method.png", { as: "image", type: "image/png" });

	// Fetch the HTML during idle so it lands in HTTP cache for the upcoming navigation.
	idle(() => {
		fetch("/onevision-encoder/", { method: "GET", credentials: "include" }).catch(() => {});
	});
}

function hot() {
	if (didHot) return;
	didHot = true;

	addLink(
		"prefetch",
		"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
		{ as: "style", crossorigin: "anonymous" },
	);
	addLink(
		"prefetch",
		"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
		{ as: "style" },
	);
	addLink("prefetch", "https://cdn.tailwindcss.com", { as: "script" });

	if (isFastEnoughForVideoPrefetch()) {
		addLink("prefetch", mediaUrl("onevision-encoder/images/case1.webm"), {
			as: "video",
			type: "video/webm",
			crossorigin: "anonymous",
		});
		addLink("prefetch", mediaUrl("onevision-encoder/images/global_contrastive_comparison.webm"), {
			as: "video",
			type: "video/webm",
			crossorigin: "anonymous",
		});
	}
}

export function preloadOneVisionEncoder(level: PreloadLevel) {
	if (typeof window === "undefined") return;
	if (isSaveDataEnabled() || isSlowConnection()) return;

	if (level === "warm") warm();
	if (level === "hot") {
		warm();
		hot();
	}
}

export function maybePreloadOneVisionEncoderFromHome() {
	if (typeof window === "undefined") return;
	if (isSaveDataEnabled() || isSlowConnection()) return;
	if (hasCookie(COOKIE_NAME)) return;

	preloadOneVisionEncoder("warm");
	setCookie(COOKIE_NAME, "1", COOKIE_MAX_AGE_SECONDS);
}
