const DEFAULT_MEDIA_BASE_URL = "https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com";

export const MEDIA_BASE_URL = (
	process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim() || DEFAULT_MEDIA_BASE_URL
).replace(/\/+$/, "");

export function mediaUrl(path: string): string {
	const cleanPath = path.replace(/^\/+/, "");
	return `${MEDIA_BASE_URL}/${cleanPath}`;
}
