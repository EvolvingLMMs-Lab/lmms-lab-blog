"use client";

import React from "react";

interface GradientDitherProps {
  className?: string;
  opacity?: number;
  direction?: "to-bottom" | "to-top" | "to-right" | "to-left" | "to-bottom-right";
  color?: string;
}

export function GradientDither({ 
  className = "", 
  opacity = 0.2,
  direction = "to-bottom-right",
  color = "var(--foreground)" 
}: GradientDitherProps) {
  // SVG pattern for a single 4x4 dither cell
  // We use multiple patterns to create density levels
  const patternId = React.useId();
  
  return (
    <div 
      className={`gradient-dither ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: opacity,
        maskImage: getMaskGradient(direction),
        WebkitMaskImage: getMaskGradient(direction),
        backgroundColor: "transparent",
      }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern 
            id={`${patternId}-dots`} 
            x="0" 
            y="0" 
            width="8" 
            height="8" 
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="2" height="2" fill={color} />
            <rect x="4" y="4" width="2" height="2" fill={color} />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId}-dots)`} />
      </svg>
    </div>
  );
}

function getMaskGradient(direction: string) {
  switch (direction) {
    case "to-bottom":
      return "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)";
    case "to-top":
      return "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)";
    case "to-right":
      return "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)";
    case "to-left":
      return "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)";
    case "to-bottom-right":
    default:
      return "linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)";
  }
}
