"use client";

import { useEffect } from "react";
import { maybePreloadOneVisionEncoderFromHome } from "@/components/preload/onevisionEncoderPreload";

export default function OneVisionEncoderPreloader() {
	useEffect(() => {
		maybePreloadOneVisionEncoderFromHome();
	}, []);

	return null;
}
