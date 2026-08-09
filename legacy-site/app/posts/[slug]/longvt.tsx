"use client";

import { useState } from "react";
import "./llava-ov-1-5.css";

function PieChart({
  id,
  slices,
  R = 110,
  title,
  subtitle,
}: {
  id: string;
  slices: { label: string; value: number; color: string }[];
  R?: number;
  title: string;
  subtitle: string;
}) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  let cum = 0;

  const paths = slices.map((d) => {
    const a0 = (cum / total) * 2 * Math.PI - Math.PI / 2;
    cum += d.value;
    const a1 = (cum / total) * 2 * Math.PI - Math.PI / 2;
    const large = d.value / total > 0.5 ? 1 : 0;

    const x0 = R * Math.cos(a0);
    const y0 = R * Math.sin(a0);
    const x1 = R * Math.cos(a1);
    const y1 = R * Math.sin(a1);

    const pct = Math.round((d.value / total) * 100);
    let labelNode = null;
    if (pct >= 2) {
      const mid = (a0 + a1) / 2;
      const lr = R + 16;
      const tx = lr * Math.cos(mid);
      const ty = lr * Math.sin(mid);
      labelNode = (
        <text
          x={tx}
          y={ty}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "11.5px",
            fill: "rgba(255,255,255,0.95)",
            fontWeight: "bold",
            pointerEvents: "none",
          }}
        >
          {pct}%
        </text>
      );
    }

    return (
      <g key={d.label}>
        <path
          d={`M0,0 L${x0},${y0} A${R},${R} 0 ${large},1 ${x1},${y1} Z`}
          fill={d.color}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1.5"
        />
        {labelNode}
      </g>
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 45%", minWidth: 320 }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem", opacity: 0.9 }}>{title}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <svg width="270" height="270" viewBox="-135 -135 270 270" style={{ overflow: "visible" }} role="img" aria-label={title}>
          <title>{title}</title>
          {paths}
        </svg>
        <div style={{
          display: "grid",
          gridTemplateColumns: id === "pie-video" ? "1fr 1fr" : "1fr",
          gap: "0.4rem 1rem",
          fontSize: "0.85rem",
          textAlign: "left"
        }}>
          {slices.map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: d.color, flexShrink: 0, display: "inline-block", border: "1px solid rgba(0,0,0,0.2)" }} />
              <span style={{ opacity: 0.9 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: "0.95rem", marginTop: "1.2rem", opacity: 0.85 }}>{subtitle}</div>
    </div>
  );
}

const videoData = [
  { label: "Education",       value: 14, color: "#bfb8af" },
  { label: "Film",            value:  4, color: "#6366f1" },
  { label: "Sports",          value:  2, color: "#f4a261" },
  { label: "News & Politics", value:  3, color: "#4caf50" },
  { label: "Comedy",          value:  8, color: "#bdbdbd" },
  { label: "Pets & Animals",  value:  2, color: "#2d6a4f" },
  { label: "Science",         value:  3, color: "#a855f7" },
  { label: "Music",           value:  6, color: "#ec4899" },
  { label: "Travel & Events", value:  9, color: "#c9b97a" },
  { label: "People & Blogs",  value: 14, color: "#a08060" },
  { label: "Entertainment",   value: 27, color: "#8ecae6" },
  { label: "Gaming",          value:  8, color: "#e9c46a" },
];

const questionData = [
  { label: "Object Recognition",            value: 41, color: "#f4a261" },
  { label: "Optical Character Recognition", value: 20, color: "#e9c46a" },
  { label: "Action Recognition",            value: 16, color: "#8ecae6" },
  { label: "Attribute Identification",      value: 11, color: "#72b046" },
  { label: "Spatial Relationship",          value:  1, color: "#a855f7" },
  { label: "Plot Synopsis",                 value:  2, color: "#f2a0b0" },
  { label: "Temporal Reasoning",            value:  9, color: "#3b82f6" },
];

export default function LongVTPage({ post }: { post: any }) {
  const { title, date, mainTags } = post;

  const bibtex = `@article{yang2025longvt,
    title={LongVT: Incentivizing "Thinking with Long Videos" via Native Tool Calling},
    author={Yang, Zuhao and Wang, Sudong and Zhang, Kaichen and Wu, Keming and Leng, Sicong and Zhang, Yifan and Li, Bo and Qin, Chengwei and Lu, Shijian and Li, Xingxuan and Bing, Lidong},
    journal={arXiv preprint arXiv:2511.20785},
    year={2025}
}`;

  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedBlock(key);
      window.setTimeout(() => {
        setCopiedBlock((current) => (current === key ? null : current));
      }, 1600);
    } catch {
      setCopiedBlock(null);
    }
  };

  return (
    <div className="lov15-container longvt-white-page">
      <div className="lov15-wrapper longvt-paper-panel">
        <style>{`
          .lov15-container.longvt-white-page {
            background: #ffffff !important;
            min-height: 100vh;
          }
          .lov15-container.longvt-white-page::before,
          .lov15-container.longvt-white-page::after {
            display: none !important;
          }
          .longvt-paper-panel {
            background-color: #ffffff;
            color: #2b2b2b;
            border-radius: 0;
            padding: 3rem 4rem;
            margin: 0 auto;
            box-shadow: none;
            max-width: 1100px;
            min-height: 100vh;
          }
          .longvt-paper-panel h1, 
          .longvt-paper-panel h2, 
          .longvt-paper-panel h3, 
          .longvt-paper-panel h4 {
            color: #1a1a1a;
          }
          .longvt-paper-panel h2 {
            margin-top: 3.25rem;
            margin-bottom: 1.15rem;
            font-size: 1.65rem;
            line-height: 1.18;
            letter-spacing: -0.028em;
          }
          .longvt-paper-panel h3 {
            margin-top: 2.1rem;
            margin-bottom: 0.65rem;
            font-size: 1.18rem;
            line-height: 1.28;
            letter-spacing: -0.02em;
          }
          .longvt-paper-panel a {
            color: #03639a;
          }
          .longvt-paper-panel hr {
            border: 0;
            border-top: 1px solid rgba(15, 23, 42, 0.1) !important;
            margin: 3.2rem 0 !important;
          }
          /* update hero cards for light background */
          .longvt-paper-panel .rl-hero-cards {
            gap: 0.9rem;
            margin-top: 1.6rem;
            margin-bottom: 2.2rem;
          }
          .longvt-paper-panel .rl-hero-card {
            background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
            border: 1px solid rgba(15, 23, 42, 0.08);
            color: #1f2937;
            border-radius: 999px;
            padding: 0.7rem 1.15rem;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          }
          .longvt-paper-panel .rl-hero-card:hover {
            background: linear-gradient(180deg, #ffffff 0%, #eff5fb 100%);
            border-color: rgba(3, 99, 154, 0.18);
            color: #0b5f92;
          }
          /* Authors link override */
          .longvt-paper-panel .lov15-authors a {
            color: #03639a;
            border-bottom-color: rgba(3, 99, 154, 0.3);
          }
          .longvt-paper-panel .lov15-authors a:hover {
            border-bottom-color: rgba(3, 99, 154, 0.7);
            color: #024a75;
          }
          /* Paper components text colors */
          .longvt-paper-panel .lov15-paper-shell {
            background: #ffffff;
            border: 1px solid rgba(254, 215, 170, 0.22);
            box-shadow: none;
          }
          .longvt-paper-panel .lov15-paper-caption {
            color: #4b5563;
            border-bottom: 1px solid rgba(254, 215, 170, 0.2);
            padding: 0 0 0.8rem;
            margin-bottom: 1rem;
            font-size: 0.95rem;
            line-height: 1.55;
          }
          .longvt-paper-panel .lov15-paper-caption-label {
            background: rgba(3, 99, 154, 0.08);
            color: #03639a;
            border: 1px solid rgba(3, 99, 154, 0.12);
            border-radius: 999px;
            padding: 0.2rem 0.58rem;
            margin-right: 0.5rem;
          }
          .longvt-paper-panel .lov15-paper-table {
            border-collapse: separate;
            border-spacing: 0;
            box-shadow: none;
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 12px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.015);
            width: 100%;
            color: #2b2b2b;
          }
          .longvt-paper-panel .lov15-paper-head-row th {
            font-size: 0.76rem;
            line-height: 1.1;
            white-space: normal;
            padding: 0.58rem 0.56rem;
            background: rgba(15, 23, 42, 0.03) !important;
            border-bottom: 1px solid rgba(148, 163, 184, 0.2) !important;
            color: #1a1a1a;
          }
          .longvt-paper-panel .lov15-paper-table td {
            padding: 0.5rem 0.56rem;
            vertical-align: middle;
            border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
            font-size: 0.88rem; /* Unified body type scale */
          }
          .longvt-paper-panel .lov15-paper-table tbody tr:last-child td {
            border-bottom: none !important;
          }
          /* First column emphasis */
          .longvt-paper-panel .lov15-paper-table th:first-child,
          .longvt-paper-panel .lov15-paper-table td:first-child {
            text-align: left;
            padding-left: 0.85rem;
            font-weight: 500;
          }
          /* Highlights */
          .longvt-paper-panel .lov15-paper-col-hi {
            background: rgba(3, 99, 154, 0.04) !important;
          }
          .longvt-paper-panel .longvt-group-alt td {
            background: rgba(3, 99, 154, 0.02) !important;
          }
          .longvt-paper-panel .longvt-row-highlight td {
            background: rgba(3, 99, 154, 0.055) !important;
            color: #000;
            font-weight: 600;
          }
          .longvt-paper-panel .longvt-row-highlight td.lov15-paper-col-hi {
            background: rgba(3, 99, 154, 0.085) !important;
          }
          .longvt-paper-panel .lov15-paper-num {
            font-family: var(--font-mono), monospace;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0;
            font-size: 0.88rem;
            text-align: center;
          }
          .longvt-paper-panel .lov15-paper-table tbody td {
            font-size: 0.88rem;
            line-height: 1.55;
          }
          /* Section headers */
          .longvt-paper-panel .lov15-paper-section-top td {
            font-weight: 600;
            opacity: 0.82;
            padding-top: 0.58rem !important;
            padding-bottom: 0.3rem !important;
            font-size: 0.88rem;
            letter-spacing: 0.01em;
            background: rgba(15, 23, 42, 0.022) !important;
            border-top: 1px solid rgba(148, 163, 184, 0.16) !important;
          }
          .longvt-paper-panel .longvt-sub-header td {
            color: #444;
            font-weight: 600;
            opacity: 0.82;
            padding-top: 0.54rem !important;
            padding-bottom: 0.28rem !important;
            font-size: 0.88rem;
            letter-spacing: 0.01em;
          }
          /* Captions */
          .longvt-paper-panel .lov15-paper-caption {
            color: #4b5563;
            border-bottom: 1px solid rgba(148, 163, 184, 0.18);
            padding: 0 0 0.68rem;
            margin-bottom: 0.95rem;
            font-size: 0.95rem;
            line-height: 1.55;
          }
          .longvt-paper-panel .lov15-paper-caption-label {
            background: rgba(3, 99, 154, 0.08);
            color: #03639a;
            border: 1px solid rgba(3, 99, 154, 0.12);
            border-radius: 999px;
            padding: 0.2rem 0.58rem;
            margin-right: 0.5rem;
            font-weight: 600;
          }
          /* Sub-headers for table headings */
          .longvt-contam-sub,
          .longvt-quant-sub,
          .longvt-ablation-sub {
            font-size: 0.62rem;
            opacity: 0.7;
            display: block;
            margin-top: 0.1rem;
            font-weight: normal;
          }
          /* Fix specific layout issues without overriding global fonts */
          .longvt-contam-table {
            min-width: 800px;
            table-layout: auto;
          }
          .longvt-dataset-table {
            min-width: 800px;
            table-layout: fixed;
          }
          .longvt-dataset-table th:nth-child(1), .longvt-dataset-table td:nth-child(1) { width: 18%; }
          .longvt-dataset-table th:nth-child(2), .longvt-dataset-table td:nth-child(2) { width: 26%; }
          .longvt-dataset-table th:nth-child(3), .longvt-dataset-table td:nth-child(3) { width: 31%; }
          .longvt-dataset-table th:nth-child(4), .longvt-dataset-table td:nth-child(4),
          .longvt-dataset-table th:nth-child(5), .longvt-dataset-table td:nth-child(5) { width: 12.5%; text-align: right; }
          .longvt-dataset-table .lov15-paper-num { text-align: right; }
          .longvt-quant-table {
            min-width: 900px;
            table-layout: auto;
          }
          .longvt-ablation-table {
            min-width: 700px;
            table-layout: auto;
          }
          /* Resource cards */
          .longvt-paper-panel .lov15-resource-card {
            background: linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
            color: #2b2b2b;
            border-radius: 16px;
            overflow: hidden;
          }
          .longvt-paper-panel .lov15-resource-header {
            background: linear-gradient(180deg, rgba(3, 99, 154, 0.05), rgba(3, 99, 154, 0.015));
            border-bottom: 1px solid rgba(15, 23, 42, 0.05);
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          .longvt-paper-panel .lov15-resource-header h3 {
            color: #1a1a1a;
          }
          .longvt-paper-panel .lov15-resource-header-accent {
            background: linear-gradient(90deg, rgba(3, 99, 154, 0.95), rgba(56, 189, 248, 0.65));
            height: 3px;
            border-radius: 999px;
          }
          .longvt-paper-panel .lov15-resource-item {
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.06);
            color: #334155;
            border-radius: 12px;
          }
          .longvt-paper-panel .lov15-resource-item:hover {
            background: #f8fbfe;
            border-color: rgba(3, 99, 154, 0.14);
          }
          .longvt-paper-panel .lov15-resource-item-top strong {
            color: #1a1a1a;
          }
          .longvt-paper-panel .lov15-resource-badge {
            background: rgba(3, 99, 154, 0.08);
            color: #03639a;
            border: 1px solid rgba(3, 99, 154, 0.12);
          }
          /* Code block */
          .longvt-paper-panel .lov15-code-demo,
          .longvt-paper-panel pre {
            background: #f6f7f8 !important;
            border: 1px solid rgba(0,0,0,0.08) !important;
            color: #2b2b2b !important;
          }
          .longvt-paper-panel .lov15-code-toolbar {
            background: #e0e0e0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            color: #333;
          }
          .longvt-paper-panel .lov15-code-dots span {
            background: rgba(0,0,0,0.2);
          }
          .longvt-paper-panel .lov15-code-body {
            color: #333;
          }
          .longvt-paper-panel pre code {
            color: #2b2b2b !important;
          }
          .longvt-paper-panel .lov15-copy-button {
            background: rgba(0,0,0,0.05);
            color: #333;
            border: 1px solid rgba(0,0,0,0.1);
          }
          .longvt-paper-panel .lov15-copy-button:hover {
            background: rgba(0,0,0,0.1);
          }
          /* Code tags */
          .longvt-paper-panel p code, .longvt-paper-panel li code {
            background: rgba(0,0,0,0.05);
            color: #03639a;
            border: 1px solid rgba(0,0,0,0.1);
          }
          .longvt-paper-panel .lov15-meta {
            color: #666;
          }
          .longvt-paper-panel .lov15-tag {
            background: rgba(0,0,0,0.05);
            color: #555;
          }
          /* Title */
          .longvt-paper-panel .lov15-title {
            color: #111;
          }
          /* Sub header text */
          .longvt-paper-panel .longvt-sub-header td {
            color: #444;
          }
          .longvt-paper-panel .lov15-citation {
            margin-top: 3rem;
            padding-top: 0.5rem;
          }
          .longvt-paper-panel .lov15-citation-head {
            margin-bottom: 0.9rem;
            padding-bottom: 0;
            border-bottom: none;
          }
          .longvt-paper-panel .lov15-citation h2,
          .longvt-paper-panel .lov15-citation-head h2 {
            font-size: 1.55rem;
            letter-spacing: -0.02em;
            color: #111;
            margin: 0;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-demo {
            background: #fbfbfc !important;
            border: 1px solid rgba(15, 23, 42, 0.08) !important;
            border-radius: 14px;
            overflow: hidden;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-toolbar {
            background: linear-gradient(180deg, #f3f4f6 0%, #eceff3 100%);
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            padding-top: 0.8rem;
            padding-bottom: 0.8rem;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-title {
            font-weight: 700;
            color: #1f2937;
            letter-spacing: -0.01em;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-lang {
            background: rgba(3, 99, 154, 0.08);
            color: #03639a;
            border: 1px solid rgba(3, 99, 154, 0.14);
            border-radius: 999px;
            padding: 0.22rem 0.6rem;
            text-transform: lowercase;
          }
          .longvt-paper-panel .lov15-citation .lov15-copy-button {
            background: #ffffff;
            color: #1f2937;
            border: 1px solid rgba(15, 23, 42, 0.1);
            border-radius: 999px;
            padding: 0.38rem 0.8rem;
            font-weight: 600;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
          }
          .longvt-paper-panel .lov15-citation .lov15-copy-button:hover {
            background: #f8fafc;
            border-color: rgba(3, 99, 154, 0.2);
            color: #03639a;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body {
            background: #ffffff;
            color: #1f2937;
            padding: 1.2rem 1.25rem 1.3rem;
            scrollbar-width: thin;
            scrollbar-color: rgba(148, 163, 184, 0.85) rgba(226, 232, 240, 0.9);
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body::-webkit-scrollbar-track {
            background: rgba(226, 232, 240, 0.9);
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.85);
            border-radius: 999px;
            border: 2px solid rgba(226, 232, 240, 0.9);
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.92);
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body pre {
            margin: 0;
            background: transparent !important;
            border: none !important;
          }
          .longvt-paper-panel .lov15-citation .lov15-code-body code {
            color: #1f2937 !important;
            font-size: 0.95rem;
            line-height: 1.7;
          }
          @media (max-width: 768px) {
            .longvt-paper-panel {
              padding: 1.5rem 1rem;
              margin: 0;
              border-radius: 0;
            }
          }
        `}</style>
        <header className="lov15-header">
          <h1 className="lov15-title">{title}</h1>

          <div className="lov15-meta">
            <span>
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {mainTags && mainTags.length > 0 && (
              <>
                <span>/</span>
                {mainTags.map((tag: string) => (
                  <span key={tag} className="lov15-tag">{tag}</span>
                ))}
              </>
              )}
            </div>

          <style>{`
            .lov15-authors a {
              color: var(--foreground, #fed7aa); text-decoration: none; border-bottom: 1px dashed rgba(254,215,170,0.3);
              transition: border-color 0.2s, opacity 0.2s;
            }
            .lov15-authors a:hover { border-bottom-color: rgba(254,215,170,0.7); opacity: 1; }
          `}</style>
          <div className="lov15-authors">
            <a href="https://mwxely.github.io/" target="_blank" rel="noopener noreferrer">Zuhao Yang</a>*,{" "}
            <a href="https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=Sudong+Wang" target="_blank" rel="noopener noreferrer">Sudong Wang</a>*,{" "}
            <a href="https://github.com/KaichenZhang" target="_blank" rel="noopener noreferrer">Kaichen Zhang</a>*,{" "}
            <a href="https://scholar.google.com/citations?hl=en&user=cOzwZBMAAAAJ" target="_blank" rel="noopener noreferrer">Keming Wu</a>,{" "}
            <a href="https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=Sicong+Leng" target="_blank" rel="noopener noreferrer">Sicong Leng</a>,{" "}
            <a href="https://yifzhang.com/" target="_blank" rel="noopener noreferrer">Yifan Zhang</a>,{" "}
            <a href="https://brianboli.com/" target="_blank" rel="noopener noreferrer">Bo Li</a>,{" "}
            <a href="https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=Chengwei+Qin" target="_blank" rel="noopener noreferrer">Chengwei Qin</a>,{" "}
            <a href="https://personal.ntu.edu.sg/shijian.lu/" target="_blank" rel="noopener noreferrer">Shijian Lu</a>,{" "}
            <a href="https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=Xingxuan+Li" target="_blank" rel="noopener noreferrer">Xingxuan Li</a>,{" "}
            <a href="https://lidongbing.github.io/" target="_blank" rel="noopener noreferrer">Lidong Bing</a>
          </div>

          <style>{`
            .rl-hero-cards {
              display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem;
              margin-top: 1.5rem; margin-bottom: 2rem;
            }
            .rl-hero-card {
              display: flex; align-items: center; gap: 0.5rem;
              padding: 0.6rem 1.1rem; border-radius: 8px;
              background: rgba(254,215,170,0.06);
              border: 1px solid rgba(254,215,170,0.18);
              color: var(--foreground, #fed7aa);
              font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600;
              text-decoration: none; letter-spacing: 0.02em;
              transition: background 0.2s, border-color 0.2s, transform 0.15s;
            }
            .rl-hero-card:hover {
              background: rgba(254,215,170,0.12);
              border-color: rgba(254,215,170,0.35);
              transform: translateY(-1px);
            }
            .rl-hero-card svg { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.7; }
          `}</style>
          <div className="rl-hero-cards">
            <a className="rl-hero-card" href="https://arxiv.org/abs/2511.20785" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M2.1 4.5L6.6 12l-4.5 7.5h3.3L9.9 12 5.4 4.5H2.1zm6 0L12.6 12l-4.5 7.5h3.3L15.9 12l-4.5-7.5H8.1zm6 0L18.6 12l-4.5 7.5h3.3L21.9 12l-4.5-7.5H14.1z"/></svg>
              Paper
            </a>
            <a className="rl-hero-card" href="https://github.com/EvolvingLMMs-Lab/LongVT" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Code
            </a>
            <a className="rl-hero-card" href="https://huggingface.co/longvideotool" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM5.5 9C3 9 1 11 1 13.5V15a1 1 0 001 1h3.07a5.98 5.98 0 01-.07-.93V15c0-1.94.93-3.66 2.36-4.75A4.47 4.47 0 005.5 9zm13 0c-.64 0-1.24.13-1.86.25A5.97 5.97 0 0119 15v.07c0 .31-.02.62-.07.93H22a1 1 0 001-1v-1.5C23 11 21 9 18.5 9zM12 9a4 4 0 100-8 4 4 0 000 8zm0 1c-3.33 0-6 2.67-6 6v1a1 1 0 001 1h10a1 1 0 001-1v-1c0-3.33-2.67-6-6-6z"/></svg>
              Models
            </a>
            <a className="rl-hero-card" href="https://huggingface.co/longvideotool" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM5.5 9C3 9 1 11 1 13.5V15a1 1 0 001 1h3.07a5.98 5.98 0 01-.07-.93V15c0-1.94.93-3.66 2.36-4.75A4.47 4.47 0 005.5 9zm13 0c-.64 0-1.24.13-1.86.25A5.97 5.97 0 0119 15v.07c0 .31-.02.62-.07.93H22a1 1 0 001-1v-1.5C23 11 21 9 18.5 9zM12 9a4 4 0 100-8 4 4 0 000 8zm0 1c-3.33 0-6 2.67-6 6v1a1 1 0 001 1h10a1 1 0 001-1v-1c0-3.33-2.67-6-6-6z"/></svg>
              Data
            </a>
            <a className="rl-hero-card" href="https://huggingface.co/spaces/longvideotool/LongVT-Demo" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Demo
            </a>
          </div>
        </header>

        <main className="lov15-content">
          {/* Hero Image */}
          <div style={{ margin: "0 auto 2rem", maxWidth: "100%", borderRadius: 8, overflow: "hidden", maxHeight: 320 }}>
            <img
              src="/images/longvt_images/teaser.png"
              alt="LongVT Interleaved Multimodal Chain-of-Tool-Thought"
              style={{ width: "100%", height: 320, objectFit: "cover", objectPosition: "center top", display: "block" }}
            />
          </div>

          {/* ─── TL;DR ─── */}
          <h2>TL;DR</h2>
          <p>
            We teach vision-language models to <strong>think like humans</strong> when watching long videos: instead of trying to memorize everything at once, the model learns to <em>skim first, then zoom in</em> on relevant moments. This is achieved through a native tool-calling mechanism where the model can invoke <code>crop_video(start, end)</code> to inspect specific clips on demand. The result? A 7B model that outperforms much larger models on long-video understanding tasks.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── The Problem ─── */}
          <h2>The Problem: Why Long Videos Are Hard</h2>
          <p>
            Imagine watching a 2-hour movie and being asked: <em>&ldquo;What was the character wearing when they first entered the coffee shop?&rdquo;</em> Even for humans, this requires a specific strategy: you don&rsquo;t re-watch the entire movie — you mentally locate the relevant scene, then focus on those few seconds.
          </p>
          <p>Current vision-language models don&rsquo;t work this way. They typically:</p>
          <ol>
            <li><strong>Sample frames uniformly</strong> across the video (missing critical moments)</li>
            <li><strong>Process everything at once</strong> (overwhelming the context window)</li>
            <li><strong>Hallucinate</strong> when the answer isn&rsquo;t in the sampled frames</li>
          </ol>
          <p>
            The core issue is that <strong>evidence in long videos is sparse and temporally localized</strong>. A 2-hour video at 1 FPS gives you 7,200 frames, but the answer to your question might depend on just 3–5 frames buried somewhere in the middle.
          </p>

          {/* ─── Our Insight ─── */}
          <h2>Our Insight: Let Models &ldquo;Think with Tools&rdquo;</h2>
          <p>
            The key insight behind LongVT is simple: <strong>instead of forcing models to process everything, let them actively seek evidence</strong>.
          </p>
          <p>We introduce a native tool-calling paradigm where the model can:</p>
          <ol>
            <li><strong>Preview</strong> the video globally (sparse sampling)</li>
            <li><strong>Hypothesize</strong> which time window might contain the answer</li>
            <li><strong>Zoom in</strong> by calling <code>crop_video(start_time, end_time)</code></li>
            <li><strong>Verify or refine</strong> based on what it actually sees</li>
          </ol>
          <p>
            This mimics the human cognitive process of <em>global-to-local reasoning</em>. The model isn&rsquo;t just passively processing frames — it&rsquo;s actively investigating.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Overview / Contributions ─── */}
          <h2>Overview</h2>
          <p>Our contributions are threefold:</p>

          <p>
            <strong>(1) LongVT: An End-to-End Agentic Framework for &ldquo;Thinking with Long Videos&rdquo;</strong><br />
            We introduce a novel paradigm that natively interleaves multimodal tool-augmented Chain-of-Thought (CoT) with on-demand clip inspection over hours-long videos, enabling large multimodal models (LMMs) to perform more effective and reliable long-video reasoning.
          </p>

          <p>
            <strong>(2) VideoSIAH: A Fine-Grained Data Suite for Evidence-Sparse Long-Video Reasoning</strong><br />
            We construct a scalable data pipeline that produces diverse and high-quality QA data and tool-integrated reasoning traces, and a dedicated benchmark under a video segment-in-a-haystack setting.
          </p>

          <p>
            <strong>(3) LongVT-7B-RFT: A State-of-the-Art Baseline with Invaluable Insights</strong><br />
            Through extensive quantitative comparisons, systematic ablations on data recipes, training strategies, and design choices, as well as in-depth analyses of training dynamics, we establish and open-source a powerful baseline model with &ldquo;thinking with long videos&rdquo; capabilities.
          </p>

          {/* ─── Why Native Tool Calling ─── */}
          <h3>Why &ldquo;Native&rdquo; Tool Calling Matters</h3>
          <p>
            You might ask: why not just use an external retrieval system? The key difference is <strong>agency</strong>. In LongVT:
          </p>
          <ul>
            <li>The model <em>decides</em> when to call the tool (not every query needs it)</li>
            <li>The model <em>chooses</em> the time window based on its reasoning</li>
            <li>The model <em>integrates</em> the retrieved evidence into its thought process</li>
          </ul>
          <p>
            This is fundamentally different from retrieval-augmented generation (RAG), where retrieval happens before reasoning. In LongVT, <strong>retrieval is part of reasoning</strong>.
          </p>

          <p style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: 1.6 }}>
            <strong>Interleaved Multimodal Chain-of-Tool-Thought (iMCoTT).</strong> Compared to prior text-based CoT reasoning, iMCoTT in our proposed LongVT can <strong>natively</strong> perform self-reflection via <strong>calling</strong> <code>crop_video(start_time, end_time)</code> <strong>tool</strong>. It proposes a time window after a global preview, proactively fetches the corresponding short clip, rethinks based on the new evidence, and determines whether to refine or answer directly. Such tool-augmented reasoning behaviors ground each step in what is actually seen rather than blindly rephrasing in text-only CoT, which mitigates hallucination and leads to enhanced temporal localization and answer correctness.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Motivation: VideoSIAH ─── */}
          <h2>Motivation of VideoSIAH</h2>

          <h3>The Data Gap</h3>
          <p>Having a good method is only half the battle — you need the right data to train it. We found that existing long-video datasets have two major problems:</p>
          <ol>
            <li><strong>Coarse-grained annotations</strong>: Most datasets have clip-level QAs that don&rsquo;t require precise temporal reasoning. A model can often guess the answer without knowing <em>when</em> something happened.</li>
            <li><strong>Benchmark contamination</strong>: Many multiple-choice benchmarks can be &ldquo;solved&rdquo; without even watching the video! Our contamination study (see table below) shows that some models perform well above chance in the &ldquo;No Visual&rdquo; setting.</li>
          </ol>

          <h3>VideoSIAH: Segment-in-a-Haystack</h3>
          <p>
            To address this, we created <strong>VideoSIAH</strong> — a dataset specifically designed for the &ldquo;needle in a haystack&rdquo; scenario where the answer depends on a small segment within a long video.
          </p>
          <p>Key design principles:</p>
          <ul>
            <li><strong>Open-ended questions</strong>: No multiple choice to game</li>
            <li><strong>Human validation</strong>: Annotators verify that questions truly require temporal localization</li>
            <li><strong>Tool-integrated traces</strong>: Training data includes the reasoning process, not just answers</li>
          </ul>

          {/* ─── Table: Contamination Study ─── */}
          <div className="lov15-paper-breakout lov15-paper-breakout-primary">
            <div className="lov15-paper-shell lov15-paper-shell-primary">
              <div className="lov15-paper-caption lov15-paper-caption-primary">
                <span className="lov15-paper-caption-label">Table 1</span>
                Contamination Tests for Qwen-VL Series on Long Video Understanding and Reasoning Benchmarks. VideoSIAH-Eval shows &ldquo;-&rdquo; for Rearranged Choices since it is fully open-ended QA.
              </div>
              <div className="lov15-paper-table-scroll">
                <table className="lov15-paper-table lov15-paper-table-primary longvt-contam-table">
                  <thead>
                    <tr className="lov15-paper-head-row">
                      <th style={{ textAlign: "left", paddingLeft: "0.85rem" }}>Setting</th>
                      <th style={{ textAlign: "center" }}>VideoMME<br /><span className="longvt-contam-sub">(w/o sub)</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-contam-sub">adapt.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-contam-sub">comp.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-contam-sub">perc.</span></th>
                      <th style={{ textAlign: "center" }} className="lov15-paper-col-hi">VideoSIAH<br /><span className="longvt-contam-sub">Eval</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Qwen2.5-VL-7B */}
                    <tr className="lov15-paper-section-top longvt-sub-header longvt-row-highlight">
                      <td colSpan={6} style={{ paddingLeft: "0.85rem" }}>Qwen2.5-VL-7B-Instruct</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Original</td>
                      <td className="lov15-paper-num lov15-paper-bold">64.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">35.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">44.3</td>
                      <td className="lov15-paper-num">56.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">33.8</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>No Visual</td>
                      <td className="lov15-paper-num">40.1</td>
                      <td className="lov15-paper-num">25.7</td>
                      <td className="lov15-paper-num">38.3</td>
                      <td className="lov15-paper-num">39.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">12.7</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Rearranged Choices</td>
                      <td className="lov15-paper-num">56.0</td>
                      <td className="lov15-paper-num">29.7</td>
                      <td className="lov15-paper-num">40.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">67.0</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">-</td>
                    </tr>

                    {/* Qwen3-VL-8B */}
                    <tr className="lov15-paper-section-top longvt-sub-header longvt-row-highlight">
                      <td colSpan={6} style={{ paddingLeft: "0.85rem" }}>Qwen3-VL-8B-Instruct</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Original</td>
                      <td className="lov15-paper-num lov15-paper-bold">69.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">40.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">60.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">71.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">46.6</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>No Visual</td>
                      <td className="lov15-paper-num">44.1</td>
                      <td className="lov15-paper-num">33.7</td>
                      <td className="lov15-paper-num">39.3</td>
                      <td className="lov15-paper-num">46.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">0.00</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Rearranged Choices</td>
                      <td className="lov15-paper-num">69.0</td>
                      <td className="lov15-paper-num">36.3</td>
                      <td className="lov15-paper-num">47.7</td>
                      <td className="lov15-paper-num">69.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Data Pipeline ─── */}
          <h2>Data Pipeline</h2>
          <div style={{ margin: "0 auto 1.5rem", maxWidth: "100%", borderRadius: 8, overflow: "hidden" }}>
            <img
              src="/images/longvt_images/pipeline.png"
              alt="VideoSIAH Data Pipeline"
              style={{ width: "100%", display: "block" }}
            />
          </div>

          <p style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: 1.6 }}>
            <strong>Data Pipeline of VideoSIAH.</strong> We construct a semi-automatic data pipeline that integrates several state-of-the-art LMMs to sequentially perform long video segmentation, video clip captioning, segment-in-a-haystack QA generation, cross-modal QA filtering, and iMCoTT generation. Icons with human silhouettes denote human-in-the-loop validation. Note that iMCoTT traces are generated only for the cold-start SFT stage, whereas RL operates solely on the filtered QA pairs.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Dataset Statistics ─── */}
          <h2>Dataset Statistics</h2>

          <div className="lov15-paper-breakout lov15-paper-breakout-primary">
            <div className="lov15-paper-shell lov15-paper-shell-primary">
              <div className="lov15-paper-caption lov15-paper-caption-primary">
                <span className="lov15-paper-caption-label">Table 2</span>
                Dataset Statistics of VideoSIAH. Our proposed dataset contains large-scale non-tool SFT data, tool-augmented SFT data, RL QAs, and self-distilled RFT traces.
              </div>
              <div className="lov15-paper-table-scroll">
                <table className="lov15-paper-table lov15-paper-table-primary longvt-dataset-table">
                  <thead>
                    <tr className="lov15-paper-head-row">
                      <th style={{ textAlign: "left", paddingLeft: "0.85rem" }}>Split</th>
                      <th style={{ textAlign: "left" }}>Source</th>
                      <th style={{ textAlign: "left" }}>Purpose</th>
                      <th style={{ textAlign: "right" }}>Samples</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="lov15-paper-section-top longvt-group-alt">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 600, verticalAlign: "middle" }} rowSpan={3}>SFT (w/o tool)</td>
                      <td style={{ textAlign: "left" }}>LongVideo-Reason CoT</td>
                      <td style={{ textAlign: "left" }}>Reasoning-augmented Open-ended QA</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>5,238</td>
                      <td className="lov15-paper-num lov15-paper-bold" rowSpan={3} style={{ verticalAlign: "middle", textAlign: "right" }}>228,835</td>
                    </tr>
                    <tr className="longvt-group-alt">
                      <td style={{ textAlign: "left" }}>Video-R1 CoT</td>
                      <td style={{ textAlign: "left" }}>Reasoning-augmented Video QA</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>165,575</td>
                    </tr>
                    <tr className="longvt-group-alt">
                      <td style={{ textAlign: "left" }}>Image-based CoT</td>
                      <td style={{ textAlign: "left" }}>Reasoning-augmented Image QA</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>58,022</td>
                    </tr>

                    <tr className="lov15-paper-section-top">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 600, verticalAlign: "middle" }} rowSpan={2}>SFT (w/ tool)</td>
                      <td style={{ textAlign: "left" }}>Gemini-distilled iMCoTT</td>
                      <td style={{ textAlign: "left" }}>Tool-augmented Open-ended QA</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>12,766</td>
                      <td className="lov15-paper-num lov15-paper-bold" rowSpan={2} style={{ verticalAlign: "middle", textAlign: "right" }}>19,161</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left" }}>Qwen-distilled iMCoTT</td>
                      <td style={{ textAlign: "left" }}>Tool-augmented Temporal Grounding</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>6,395</td>
                    </tr>

                    <tr className="lov15-paper-section-top longvt-group-alt">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 600, verticalAlign: "middle" }} rowSpan={2}>RL / RFT</td>
                      <td style={{ textAlign: "left" }}>Gemini-distilled QAs</td>
                      <td style={{ textAlign: "left" }}>Open-ended QA over Long Videos</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>1,667</td>
                      <td className="lov15-paper-num lov15-paper-bold" rowSpan={2} style={{ verticalAlign: "middle", textAlign: "right" }}>17,020</td>
                    </tr>
                    <tr className="longvt-group-alt">
                      <td style={{ textAlign: "left" }}>Self-distilled iMCoTT</td>
                      <td style={{ textAlign: "left" }}>Agentic Behaviors</td>
                      <td className="lov15-paper-num" style={{ textAlign: "right" }}>15,353</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Category Distribution Images */}
          <div className="lov15-paper-breakout lov15-paper-breakout-primary" style={{ margin: "2.5rem 0" }}>
            <div className="lov15-paper-shell lov15-paper-shell-primary" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
                <PieChart
                  id="pie-video"
                  title="Proportion of video categories"
                  subtitle="(a) Video Category Distribution"
                  slices={videoData}
                />
                <PieChart
                  id="pie-question"
                  title="Proportion of question categories"
                  subtitle="(b) Question Category Distribution"
                  slices={questionData}
                />
              </div>
              <div className="lov15-paper-caption lov15-paper-caption-primary" style={{ marginTop: "2.5rem", padding: "0 1rem" }}>
                <span className="lov15-paper-caption-label">Figure 6</span>
                <strong>Category Distribution of VideoSIAH-Eval.</strong> Video types (left) and question types (right), highlighting the diversity of our proposed benchmark.
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Quantitative Comparisons ─── */}
          <h2>Quantitative Comparisons</h2>
          <p>
            We compare our LongVT models against proprietary LMMs and state-of-the-art open-source video reasoning models across various long video understanding and reasoning benchmarks.
          </p>

          {/* Main Table — Sparse Sampling */}
          <div className="lov15-paper-breakout lov15-paper-breakout-primary">
            <div className="lov15-paper-shell lov15-paper-shell-primary">
              <div className="lov15-paper-caption lov15-paper-caption-primary">
                <span className="lov15-paper-caption-label">Table 3</span>
                Performance Comparison with Existing Video-Centric LMMs. Best and second-best results among open-source models are marked in <strong>bold</strong>.
              </div>
              <div className="lov15-paper-table-scroll">
                <table className="lov15-paper-table lov15-paper-table-primary longvt-quant-table">
                  <thead>
                    <tr className="lov15-paper-head-row">
                      <th>Model</th>
                      <th style={{ textAlign: "center" }}>Reasoning<br /><span className="longvt-quant-sub">Prompt</span></th>
                      <th style={{ textAlign: "center" }}>Tool<br /><span className="longvt-quant-sub">Calling</span></th>
                      <th style={{ textAlign: "center" }}>VideoMME<br /><span className="longvt-quant-sub">w/ sub</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-quant-sub">adapt.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-quant-sub">comp.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-quant-sub">perc.</span></th>
                      <th style={{ textAlign: "center" }}>LVBench</th>
                      <th style={{ textAlign: "center" }} className="lov15-paper-col-hi">VideoSIAH<br /><span className="longvt-quant-sub">Eval</span></th>
                      <th style={{ textAlign: "center" }}>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Proprietary */}
                    <tr className="lov15-paper-section-top longvt-sub-header">
                      <td colSpan={10} style={{ paddingLeft: "0.85rem" }}>Proprietary LMMs</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>GPT-4o</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">77.2</td>
                      <td className="lov15-paper-num">66.0</td>
                      <td className="lov15-paper-num">62.0</td>
                      <td className="lov15-paper-num">55.7</td>
                      <td className="lov15-paper-num">30.8</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">17.4</td>
                      <td className="lov15-paper-num">51.5</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Gemini 1.5 Pro</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">81.3</td>
                      <td className="lov15-paper-num">59.0</td>
                      <td className="lov15-paper-num">53.3</td>
                      <td className="lov15-paper-num">49.3</td>
                      <td className="lov15-paper-num">33.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">-</td>
                      <td className="lov15-paper-num">55.2</td>
                    </tr>

                    {/* Open-Source Sparse */}
                    <tr className="lov15-paper-section-top longvt-sub-header">
                      <td colSpan={10} style={{ paddingLeft: "0.85rem" }}>Open-Source (Sparse Sampling)</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Qwen2.5-VL-7B</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">62.6</td>
                      <td className="lov15-paper-num">37.3</td>
                      <td className="lov15-paper-num">28.0</td>
                      <td className="lov15-paper-num">36.7</td>
                      <td className="lov15-paper-num">30.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">28.1</td>
                      <td className="lov15-paper-num">37.2</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Video-R1-7B</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">61.0</td>
                      <td className="lov15-paper-num">36.3</td>
                      <td className="lov15-paper-num">40.7</td>
                      <td className="lov15-paper-num">52.3</td>
                      <td className="lov15-paper-num">37.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">27.9</td>
                      <td className="lov15-paper-num">42.6</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>VideoRFT-7B</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">60.9</td>
                      <td className="lov15-paper-num">36.7</td>
                      <td className="lov15-paper-num">42.0</td>
                      <td className="lov15-paper-num">53.0</td>
                      <td className="lov15-paper-num">34.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">26.5</td>
                      <td className="lov15-paper-num">42.3</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Video-Thinker-7B</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">61.0</td>
                      <td className="lov15-paper-num">34.3</td>
                      <td className="lov15-paper-num">44.7</td>
                      <td className="lov15-paper-num">53.0</td>
                      <td className="lov15-paper-num lov15-paper-bold">52.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">10.4</td>
                      <td className="lov15-paper-num">42.6</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>LongVT-7B-SFT (Ours)</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">12.5</td>
                      <td className="lov15-paper-num lov15-paper-bold">37.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">46.0</td>
                      <td className="lov15-paper-num lov15-paper-bold">58.3</td>
                      <td className="lov15-paper-num">36.0</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">26.8</td>
                      <td className="lov15-paper-num">36.2</td>
                    </tr>
                    <tr className="longvt-row-highlight">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 700 }}>LongVT-7B-RL (Ours)</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num lov15-paper-bold">66.1</td>
                      <td className="lov15-paper-num">32.7</td>
                      <td className="lov15-paper-num">44.7</td>
                      <td className="lov15-paper-num">50.0</td>
                      <td className="lov15-paper-num">37.8</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">31.0</td>
                      <td className="lov15-paper-num lov15-paper-bold">43.7</td>
                    </tr>

                    {/* Open-Source Dense */}
                    <tr className="lov15-paper-section-top longvt-sub-header">
                      <td colSpan={10} style={{ paddingLeft: "0.85rem" }}>Open-Source (Dense Sampling)</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Qwen2.5-VL-7B</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">64.3</td>
                      <td className="lov15-paper-num">35.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">44.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">56.7</td>
                      <td className="lov15-paper-num">40.9</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">33.8</td>
                      <td className="lov15-paper-num">46.0</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Video-R1-7B</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">60.5</td>
                      <td className="lov15-paper-num">37.3</td>
                      <td className="lov15-paper-num">38.7</td>
                      <td className="lov15-paper-num">46.3</td>
                      <td className="lov15-paper-num">40.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">33.1</td>
                      <td className="lov15-paper-num">42.7</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>VideoRFT-7B</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">49.2</td>
                      <td className="lov15-paper-num lov15-paper-bold">37.7</td>
                      <td className="lov15-paper-num">40.7</td>
                      <td className="lov15-paper-num">48.7</td>
                      <td className="lov15-paper-num">18.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">26.9</td>
                      <td className="lov15-paper-num">37.0</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>Video-Thinker-7B</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num" style={{ opacity: 0.5 }}>✗</td>
                      <td className="lov15-paper-num">60.8</td>
                      <td className="lov15-paper-num lov15-paper-bold">37.7</td>
                      <td className="lov15-paper-num">42.7</td>
                      <td className="lov15-paper-num">55.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">54.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">6.6</td>
                      <td className="lov15-paper-num">42.9</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>LongVT-7B-SFT (Ours)</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">64.9</td>
                      <td className="lov15-paper-num">32.3</td>
                      <td className="lov15-paper-num">42.0</td>
                      <td className="lov15-paper-num">49.7</td>
                      <td className="lov15-paper-num">41.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">34.8</td>
                      <td className="lov15-paper-num">44.1</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>LongVT-7B-RL (Ours)</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">66.1</td>
                      <td className="lov15-paper-num lov15-paper-bold">37.7</td>
                      <td className="lov15-paper-num">42.3</td>
                      <td className="lov15-paper-num">56.3</td>
                      <td className="lov15-paper-num">41.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">35.9</td>
                      <td className="lov15-paper-num">46.6</td>
                    </tr>
                    <tr className="lov15-paper-last-row longvt-row-highlight">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 700 }}>LongVT-7B-RFT (Ours)</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num">✓</td>
                      <td className="lov15-paper-num lov15-paper-bold">67.0</td>
                      <td className="lov15-paper-num">35.7</td>
                      <td className="lov15-paper-num">43.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">56.7</td>
                      <td className="lov15-paper-num">41.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">42.0</td>
                      <td className="lov15-paper-num lov15-paper-bold">47.7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Ablation Studies ─── */}
          <h2>Ablation Studies</h2>
          <p>We conduct comprehensive ablation studies to examine the impact of data recipes, training stages, and reward design on model performance.</p>

          <style>{`
            .longvt-white-page h3 + .lov15-paper-breakout {
              margin-top: 0.85rem;
            }
            .longvt-white-page h3 {
              margin-top: 2rem;
              margin-bottom: 0.35rem;
              color: #1a1a1a;
            }

          `}</style>

          {/* Data Recipe Ablation */}
          <h3>Data Recipe</h3>
          <div className="lov15-paper-breakout lov15-paper-breakout-primary">
            <div className="lov15-paper-shell lov15-paper-shell-primary">
              <div className="lov15-paper-caption lov15-paper-caption-primary">
                <span className="lov15-paper-caption-label">Table 4a</span>
                Data Recipe Ablation.
              </div>
              <div className="lov15-paper-table-scroll">
                <table className="lov15-paper-table lov15-paper-table-primary longvt-ablation-table">
                  <colgroup>
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                  </colgroup>
                  <thead>
                    <tr className="lov15-paper-head-row">
                      <th>Setting</th>
                      <th style={{ textAlign: "center" }}>VideoMME<br /><span className="longvt-ablation-sub">w/ sub</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-ablation-sub">adapt.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-ablation-sub">comp.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-ablation-sub">perc.</span></th>
                      <th style={{ textAlign: "center" }}>LVBench</th>
                      <th style={{ textAlign: "center" }} className="lov15-paper-col-hi">VideoSIAH<br /><span className="longvt-ablation-sub">Eval</span></th>
                      <th style={{ textAlign: "center" }}>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>SFT w/o self-curated iMCoTT</td>
                      <td className="lov15-paper-num">8.4</td>
                      <td className="lov15-paper-num lov15-paper-bold">33.6</td>
                      <td className="lov15-paper-num">41.6</td>
                      <td className="lov15-paper-num">46.0</td>
                      <td className="lov15-paper-num">15.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">4.1</td>
                      <td className="lov15-paper-num">24.8</td>
                    </tr>
                    <tr className="longvt-row-highlight">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 600 }}>SFT w/ self-curated iMCoTT</td>
                      <td className="lov15-paper-num lov15-paper-bold">64.9</td>
                      <td className="lov15-paper-num">32.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">42.0</td>
                      <td className="lov15-paper-num lov15-paper-bold">49.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">41.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">34.8</td>
                      <td className="lov15-paper-num lov15-paper-bold">44.1</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>RL w/o self-curated QAs</td>
                      <td className="lov15-paper-num">55.1</td>
                      <td className="lov15-paper-num">30.6</td>
                      <td className="lov15-paper-num">42.0</td>
                      <td className="lov15-paper-num">45.6</td>
                      <td className="lov15-paper-num">38.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">30.8</td>
                      <td className="lov15-paper-num">40.4</td>
                    </tr>
                    <tr className="lov15-paper-last-row longvt-row-highlight">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 600 }}>RL w/ self-curated QAs</td>
                      <td className="lov15-paper-num lov15-paper-bold">66.1</td>
                      <td className="lov15-paper-num lov15-paper-bold">37.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">42.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">56.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">41.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">35.9</td>
                      <td className="lov15-paper-num lov15-paper-bold">46.6</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Training Stage Ablation */}
          <h3>Training Stage</h3>
          <div className="lov15-paper-breakout lov15-paper-breakout-primary">
            <div className="lov15-paper-shell lov15-paper-shell-primary">
              <div className="lov15-paper-caption lov15-paper-caption-primary">
                <span className="lov15-paper-caption-label">Table 4b</span>
                Training Stage Ablation.
              </div>
              <div className="lov15-paper-table-scroll">
                <table className="lov15-paper-table lov15-paper-table-primary longvt-ablation-table">
                  <colgroup>
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                    <col style={{ width: "10.86%" }} />
                  </colgroup>
                  <thead>
                    <tr className="lov15-paper-head-row">
                      <th>Setting</th>
                      <th style={{ textAlign: "center" }}>VideoMME<br /><span className="longvt-ablation-sub">w/ sub</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-ablation-sub">adapt.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-ablation-sub">comp.</span></th>
                      <th style={{ textAlign: "center" }}>VideoMMMU<br /><span className="longvt-ablation-sub">perc.</span></th>
                      <th style={{ textAlign: "center" }}>LVBench</th>
                      <th style={{ textAlign: "center" }} className="lov15-paper-col-hi">VideoSIAH<br /><span className="longvt-ablation-sub">Eval</span></th>
                      <th style={{ textAlign: "center" }}>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>SFT only</td>
                      <td className="lov15-paper-num">64.9</td>
                      <td className="lov15-paper-num">32.3</td>
                      <td className="lov15-paper-num">42.0</td>
                      <td className="lov15-paper-num">49.7</td>
                      <td className="lov15-paper-num">41.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">34.8</td>
                      <td className="lov15-paper-num">44.1</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>RL only</td>
                      <td className="lov15-paper-num">52.7</td>
                      <td className="lov15-paper-num">35.3</td>
                      <td className="lov15-paper-num">43.0</td>
                      <td className="lov15-paper-num">55.1</td>
                      <td className="lov15-paper-num">37.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">28.2</td>
                      <td className="lov15-paper-num">41.9</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: "0.85rem" }}>SFT+RL</td>
                      <td className="lov15-paper-num">66.1</td>
                      <td className="lov15-paper-num lov15-paper-bold">37.7</td>
                      <td className="lov15-paper-num">42.3</td>
                      <td className="lov15-paper-num">56.3</td>
                      <td className="lov15-paper-num lov15-paper-bold">41.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi">35.9</td>
                      <td className="lov15-paper-num">46.6</td>
                    </tr>
                    <tr className="lov15-paper-last-row longvt-row-highlight">
                      <td style={{ paddingLeft: "0.85rem", fontWeight: 700 }}>SFT+RL+RFT</td>
                      <td className="lov15-paper-num lov15-paper-bold">67.0</td>
                      <td className="lov15-paper-num">35.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">43.7</td>
                      <td className="lov15-paper-num lov15-paper-bold">56.7</td>
                      <td className="lov15-paper-num">41.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi lov15-paper-bold">42.0</td>
                      <td className="lov15-paper-num lov15-paper-bold">47.7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Training Dynamics ─── */}
          <h2>Training Dynamics</h2>
          <div style={{ margin: "0 auto 1.5rem", maxWidth: "100%", borderRadius: 8, overflow: "hidden" }}>
            <img
              src="/images/longvt_images/ablation.png"
              alt="Training Dynamics and Ablations on Reward Design"
              style={{ width: "100%", display: "block" }}
            />
          </div>
          <p style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: 1.6 }}>
            <strong>(a)</strong> shows training dynamics under different accuracy and time rewards, and <strong>(b)</strong> shows the effect of tool-call reward on tool usage.
          </p>

          <p>
            <strong>Recall encourages coverage; IoU demands precision.</strong> Using Recall as the reward function during RL presents a drawback: the policy can enlarge the predicted span to envelop the ground-truth interval, which monotonically raises the Recall-based score while ignoring boundary quality. This plateau validates our hypothesized reward hacking. In contrast, IoU explicitly penalizes span inflation via the union term, yielding better-aligned boundaries and more disciplined tool use.
          </p>

          <p>
            <strong>Is tool reward really necessary?</strong> The Qwen2.5-VL-7B baseline collapses to near-zero tool calls after training in both configurations (w/ and w/o tool reward), indicating that the model does not internalize the tool&rsquo;s function. After performing cold-start SFT to obtain LongVT-7B-SFT, tool-call frequency rises during training under both configurations and accuracy improves in tandem. Hence, the tool reward is not required for basic competence: once SFT grounds the tool&rsquo;s semantics, the model learns when and how to invoke the tool.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Key Takeaways ─── */}
          <h2>Key Takeaways &amp; Lessons Learned</h2>

          <h3>1. Cold-Start SFT is Crucial for Tool Learning</h3>
          <p>
            One surprising finding was that <strong>you can&rsquo;t just RL your way to tool use</strong>. Without the cold-start SFT phase that demonstrates tool semantics, the model never learns to call tools — even with explicit tool rewards. This suggests that tool-using behaviors need to be <em>shown</em> before they can be <em>optimized</em>.
          </p>

          <h3>2. The Model Learns <em>When</em> to Use Tools</h3>
          <p>
            After SFT, the model doesn&rsquo;t blindly call tools for every query. It develops an intuition for which questions require zooming in (fine-grained visual details) versus which can be answered from the global preview (general scene understanding). This emergent selectivity wasn&rsquo;t explicitly trained — it arose naturally from the data.
          </p>

          <h3>3. IoU &gt; Recall for Temporal Grounding Rewards</h3>
          <p>
            When we first tried Recall-based rewards, we saw the model &ldquo;gaming&rdquo; the metric by predicting increasingly wide time windows. Switching to IoU forced the model to be precise about boundaries. This is a concrete example of how reward design shapes agent behavior.
          </p>

          <h3>4. Existing Benchmarks Have Contamination Issues</h3>
          <p>
            Our contamination study revealed that some models perform surprisingly well on long-video benchmarks even <em>without seeing the video</em>. This motivated us to create VideoSIAH-Eval with open-ended questions that can&rsquo;t be gamed through memorization.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── What's Next ─── */}
          <h2>What&rsquo;s Next?</h2>
          <p>LongVT opens up several exciting directions:</p>
          <ul>
            <li><strong>Multi-round tool calling</strong>: Currently, the model typically calls the tool once. Enabling iterative refinement could help with even more complex queries.</li>
            <li><strong>Tool diversity</strong>: Beyond <code>crop_video</code>, we could add tools for object tracking, scene search, or even external knowledge retrieval.</li>
            <li><strong>Longer videos</strong>: While we tested on hour-long videos, the paradigm should scale to even longer content like full TV series or lecture archives.</li>
          </ul>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ─── Resource Cards ─── */}
          <div className="lov15-resource-card">
            <div className="lov15-resource-header">
              <div className="lov15-resource-header-accent" />
              <h3>Open-Source Resources</h3>
              <p>We open-source LongVT to facilitate future development of long-video reasoning with tool calling in the community.</p>
            </div>

            <div className="lov15-resource-grid">
              <div className="lov15-resource-group">
                <div className="lov15-resource-group-label">
                  <span className="lov15-resource-group-icon">&#x2318;</span>
                  <h4>Code &amp; Paper</h4>
                </div>
                <div className="lov15-resource-items">
                  <a href="https://arxiv.org/abs/2511.20785" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>Technical Report</strong>
                      <span className="lov15-resource-badge">arXiv</span>
                    </div>
                    <span>Read our paper on arXiv</span>
                  </a>
                  <a href="https://github.com/EvolvingLMMs-Lab/LongVT" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>Code Repository</strong>
                      <span className="lov15-resource-badge">GitHub</span>
                    </div>
                    <span>Complete training and evaluation code for LongVT</span>
                  </a>
                </div>
              </div>

              <div className="lov15-resource-group">
                <div className="lov15-resource-group-label">
                  <span className="lov15-resource-group-icon">&#x25C8;</span>
                  <h4>Model Checkpoints</h4>
                </div>
                <div className="lov15-resource-items">
                  <a href="https://huggingface.co/longvideotool" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>LongVT-7B-RFT</strong>
                      <span className="lov15-resource-badge lov15-badge-accent">7B</span>
                    </div>
                    <span>Pre-trained model with SFT, RL, and RFT optimization</span>
                  </a>
                </div>
              </div>

              <div className="lov15-resource-group lov15-resource-group-wide">
                <div className="lov15-resource-group-label">
                  <span className="lov15-resource-group-icon">&#x2592;</span>
                  <h4>Training Datasets &amp; Demo</h4>
                </div>
                <div className="lov15-resource-items">
                  <a href="https://huggingface.co/longvideotool" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>VideoSIAH-SFT</strong>
                      <span className="lov15-resource-badge lov15-badge-accent">248K</span>
                    </div>
                    <span>SFT data with and without tool-augmented reasoning traces</span>
                  </a>
                  <a href="https://huggingface.co/longvideotool" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>VideoSIAH-RL</strong>
                      <span className="lov15-resource-badge lov15-badge-accent">17K</span>
                    </div>
                    <span>RL QA pairs and self-distilled RFT traces</span>
                  </a>
                  <a href="https://huggingface.co/spaces/longvideotool/LongVT-Demo" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>LongVT Demo</strong>
                      <span className="lov15-resource-badge">Spaces</span>
                    </div>
                    <span>Try LongVT interactively on Hugging Face Spaces</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Citation ─── */}
          <div className="lov15-citation">
            <div className="lov15-citation-head">
              <div>
                <h2>Citation</h2>
              </div>
            </div>
            <div className="lov15-code-demo">
              <div className="lov15-code-toolbar">
                <div className="lov15-code-dots">
                  <span /><span /><span />
                </div>
                <div className="lov15-code-title">citation.bib</div>
                <div className="lov15-code-toolbar-actions">
                  <div className="lov15-code-lang">bibtex</div>
                  <button type="button" className="lov15-copy-button" onClick={() => handleCopy("citation", bibtex)}>
                    {copiedBlock === "citation" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="lov15-code-body">
                <pre><code>{bibtex}</code></pre>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
