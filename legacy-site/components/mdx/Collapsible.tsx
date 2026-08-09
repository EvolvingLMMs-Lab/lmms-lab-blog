"use client";

import { useState } from "react";

interface CollapsibleProps {
  summary: string;
  children: React.ReactNode;
}

export function Collapsible({ summary, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        margin: "var(--space-md) 0",
        boxShadow: "0 0 0 1px currentColor",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-sm) var(--space-md)",
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: "1rem",
          textAlign: "left",
        }}
      >
        <span>{summary}</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {isOpen ? "[-]" : "[+]"}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "var(--space-md)",
            borderTop: "1px solid currentColor",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
