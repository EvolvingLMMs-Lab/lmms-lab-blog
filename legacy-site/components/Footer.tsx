import Link from "next/link";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer
			style={{
				padding: "var(--space-lg) 0",
				marginTop: "auto",
			}}
		>
			<div
				className="container"
				style={{
					display: "flex",
					alignItems: "center",
					gap: "var(--space-md)",
				}}
			>
				<span
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "0.75rem",
						opacity: 0.4,
						whiteSpace: "nowrap",
					}}
				>
					{currentYear} LMMs-Lab
				</span>

				<div
					style={{
						flex: 1,
						height: "1px",
						background: "currentColor",
						opacity: 0.15,
					}}
				/>

				<nav
					style={{
						display: "flex",
						gap: "var(--space-md)",
						fontFamily: "var(--font-mono)",
						fontSize: "0.75rem",
					}}
				>
					<Link href="https://github.com/EvolvingLMMs-Lab" className="link-underline interactive">
						GitHub
					</Link>
					<Link href="https://twitter.com/LMMsLab" className="link-underline interactive">
						Twitter
					</Link>
				</nav>
			</div>
		</footer>
	);
}
