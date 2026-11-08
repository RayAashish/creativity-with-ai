import React from 'react';

interface CodexPressLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

/**
 * CodexPress Official Emblem:
 * An illuminated open codex manuscript whose pages form code syntax brackets (< / >)
 * centered with a golden fountain-pen nib spine, symbolizing the union of code,
 * handwritten/markdown notes, and book-quality document publishing.
 */
export const CodexPressLogo: React.FC<CodexPressLogoProps> = ({
  className = 'w-8 h-8',
  size = 32,
  showText = false
}) => {
  return (
    <div className={`flex items-center space-x-2.5 ${showText ? 'select-none' : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-transform duration-300 hover:scale-105 shrink-0`}
      >
        <defs>
          {/* Deep Obsidian Tile Gradient */}
          <linearGradient id="cp_bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1c23" />
            <stop offset="50%" stopColor="#111217" />
            <stop offset="100%" stopColor="#0a0b0e" />
          </linearGradient>

          {/* Golden Quill / Spine Glow */}
          <linearGradient id="cp_gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Page Crisp Sheet Gradient */}
          <linearGradient id="cp_page_left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id="cp_page_right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="cp_drop_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.4" floodColor="#000000" />
          </filter>
        </defs>

        {/* Outer Squircle Container */}
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          fill="url(#cp_bg_grad)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
        />

        {/* Open Codex Book (Left & Right Pages) with Drop Shadow */}
        <g filter="url(#cp_drop_shadow)">
          {/* Left Page (Curved open codex folio) */}
          <path
            d="M24 13C20 12 13 10 9 12C8.4 12.2 8 12.8 8 13.5V33C8 33.6 8.5 34.1 9.1 34C13 33 19.5 34.5 24 36.5V13Z"
            fill="url(#cp_page_left)"
          />

          {/* Right Page (Curved open codex folio) */}
          <path
            d="M24 13C28 12 35 10 39 12C39.6 12.2 40 12.8 40 13.5V33C40 33.6 39.5 34.1 38.9 34C35 33 28.5 34.5 24 36.5V13Z"
            fill="url(#cp_page_right)"
          />

          {/* Book Spine Center Crease */}
          <line
            x1="24"
            y1="12"
            x2="24"
            y2="37"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Left Page: Code Bracket '<' and Manuscript Rules */}
          {/* Code bracket < */}
          <path
            d="M17 19L13 23L17 27"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Manuscript text line hints */}
          <line x1="12" y1="16" x2="20" y2="15.5" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="14" y1="30" x2="20" y2="30.5" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />

          {/* Right Page: Code Bracket '>' and Manuscript Rules */}
          {/* Code bracket > */}
          <path
            d="M31 19L35 23L31 27"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Manuscript text line hints */}
          <line x1="28" y1="15.5" x2="36" y2="16" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="28" y1="30.5" x2="34" y2="30" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />

          {/* Central Fountain Pen Nib / Bookmark Spine */}
          <path
            d="M24 8L27 15H21L24 8Z"
            fill="url(#cp_gold_grad)"
          />
          {/* Nib split line / Code slash */}
          <line x1="24" y1="10" x2="24" y2="15" stroke="#1e293b" strokeWidth="0.8" />
          {/* Nib breather hole */}
          <circle cx="24" cy="11.5" r="0.7" fill="#1e293b" />
        </g>

        {/* Illuminated Ink Spark / Dot above pen tip */}
        <circle cx="24" cy="5.5" r="1.5" fill="#f59e0b" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-mono font-bold text-sm tracking-tight text-[var(--text-primary)]">
              CodexPress
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-subtle)]">
              STUDIO
            </span>
          </div>
          <span className="text-[9px] font-mono text-[var(--text-muted)] -mt-0.5">
            Code, Notes & Document Publisher
          </span>
        </div>
      )}
    </div>
  );
};
