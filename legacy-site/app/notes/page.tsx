import type { Metadata } from "next";
import { getAllNotes } from "@/lib/posts";
import { NotesClient } from "./NotesClient";

export const metadata: Metadata = {
	title: "Notes - LMMs-Lab",
	description: "Quick notes and thoughts from LMMs-Lab",
	alternates: {
		canonical: "/notes/",
	},
};

export default function NotesPage() {
	const notes = getAllNotes();
	return <NotesClient notes={notes} />;
}
