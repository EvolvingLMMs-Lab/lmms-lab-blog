export interface TocItem {
	id: string;
	text: string;
	level: number;
}

export function extractHeadings(content: string): TocItem[] {
	const headingRegex = /^(#{2,4})\s+(.+)$/gm;
	const headings: TocItem[] = [];
	let match;

	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const text = match[2].trim();
		const id = text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-");

		headings.push({ id, text, level });
	}

	return headings;
}
