import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import HomeClient from "@/components/home/HomeClient";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	alternates: {
		canonical: "/",
	},
};

const homeStructuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Organization",
			"@id": `${SITE_URL}/#organization`,
			name: SITE_NAME,
			url: SITE_URL,
			logo: `${SITE_URL}/icon.png`,
			sameAs: [
				"https://github.com/EvolvingLMMs-Lab",
				"https://twitter.com/LMMsLab",
			],
		},
		{
			"@type": "WebSite",
			"@id": `${SITE_URL}/#website`,
			name: SITE_NAME,
			url: SITE_URL,
			description: SITE_DESCRIPTION,
			keywords: SITE_KEYWORDS.join(", "),
			publisher: {
				"@id": `${SITE_URL}/#organization`,
			},
			inLanguage: "en-US",
		},
		{
			"@type": "WebPage",
			"@id": `${SITE_URL}/#webpage`,
			name: SITE_NAME,
			url: SITE_URL,
			description: SITE_DESCRIPTION,
			isPartOf: {
				"@id": `${SITE_URL}/#website`,
			},
			about: SITE_KEYWORDS.map((keyword) => ({
				"@type": "Thing",
				name: keyword,
			})),
			inLanguage: "en-US",
		},
	],
};

export default function Home() {
	const posts = getAllPosts();
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
			/>
			<HomeClient posts={posts} />
		</>
	);
}
