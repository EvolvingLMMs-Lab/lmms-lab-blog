"use client";

import React from "react";

interface TechContainerProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function TechContainer({ children, label, className = "" }: TechContainerProps) {
  return (
    <div className={`tech-container relative ${className}`}>
      {/* Full border */}
      <div className="absolute inset-0 border border-[var(--foreground)] opacity-20 pointer-events-none z-0" />
      
      {/* Corner decorations - z-0 to stay behind content */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--foreground)] opacity-70 z-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[var(--foreground)] opacity-70 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[var(--foreground)] opacity-70 z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--foreground)] opacity-70 z-0 pointer-events-none" />

      {/* Label - z-20 to stay above content */}
      {label && (
        <div className="absolute top-0 left-6 -translate-y-1/2 px-2 bg-[var(--background)] z-20 pointer-events-none">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--foreground)] opacity-80">
            {label}
          </span>
        </div>
      )}

      {/* Content - z-10 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
