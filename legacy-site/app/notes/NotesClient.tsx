"use client";

import ArchiveList from "@/components/ArchiveList";

interface Note {
	slug: string;
	title: string;
	description?: string;
	date: string;
	tags?: string[];
}

interface NotesClientProps {
	notes: Note[];
}

export function NotesClient({ notes }: NotesClientProps) {
	return (
		<ArchiveList
			entries={notes}
			basePath="/notes"
			label="Field Notes"
			sysPath="SYS://research/notes - log"
		/>
	);
}
