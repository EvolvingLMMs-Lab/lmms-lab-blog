interface QuickLink {
  type: "paper" | "code" | "model" | "data" | "demo" | "link";
  url: string;
  label?: string;
}

interface QuickLinksProps {
  links?: QuickLink[];
}

const defaultLabels: Record<string, string> = {
  paper: "Paper",
  code: "Code",
  model: "Model",
  data: "Data",
  demo: "Demo",
  link: "Link",
};

export function QuickLinks({ links = [] }: QuickLinksProps) {
  if (links.length === 0) return null;

  return (
    <>
      <div className="quick-links">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link"
          >
            {link.label || defaultLabels[link.type]}
          </a>
        ))}
      </div>
      <style>{`
        .quick-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem 1.5rem;
          margin: 1.5rem 0;
        }
        .quick-link {
          color: var(--background);
          text-decoration: none;
          font-size: 0.9375rem;
          opacity: 0.7;
          transition: opacity 0.15s ease;
        }
        .quick-link:hover {
          opacity: 1;
        }
      `}</style>
    </>
  );
}
