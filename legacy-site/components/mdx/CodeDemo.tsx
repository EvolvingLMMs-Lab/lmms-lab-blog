"use client";

import { useState } from "react";

interface CodeDemoProps {
  title?: string;
  language?: string;
  showCopy?: boolean;
  children: React.ReactNode;
}

export function CodeDemo({ title, children, showCopy = true }: CodeDemoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codeElement = document.querySelector(`[data-code-title="${title}"] pre`);
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      data-code-title={title}
      style={{
        margin: "var(--space-md) 0",
        boxShadow: "0 0 0 1px currentColor",
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-sm) var(--space-md)",
            borderBottom: "1px solid currentColor",
            fontSize: "0.875rem",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>{title}</span>
          {showCopy && (
            <button
              onClick={handleCopy}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontSize: "0.75rem",
                opacity: 0.7,
              }}
            >
              {copied ? "[copied]" : "[copy]"}
            </button>
          )}
        </div>
      )}
      <div style={{ padding: "var(--space-md)", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
