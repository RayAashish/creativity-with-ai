import React from 'react';

interface LogoProps {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = ''
}) => {
  // Dimensions for mark
  const markDimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 44, height: 44 }
  };

  const { width, height } = markDimensions[size];

  const MarkSVG = (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
        <linearGradient id="logoAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Hexagonal Shield */}
      <polygon
        points="50,4 92,26 92,74 50,96 8,74 8,26"
        fill="url(#logoBgGrad)"
        stroke="#134e4a"
        strokeWidth="2.5"
      />

      {/* Code Brackets */}
      <path
        d="M 38,30 L 22,50 L 38,70"
        stroke="url(#logoAccentGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 62,30 L 78,50 L 62,70"
        stroke="url(#logoAccentGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Graph & Invariant Polyline */}
      <path
        d="M 50,30 L 44,40 L 56,48 L 44,56 L 50,68"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Algorithmic Tree Nodes */}
      <circle cx="50" cy="30" r="4.5" fill="url(#logoGoldGrad)" />
      <circle cx="44" cy="40" r="3" fill="#ffffff" />
      <circle cx="56" cy="48" r="4" fill="url(#logoAccentGrad)" />
      <circle cx="44" cy="56" r="3" fill="#ffffff" />
      <circle cx="50" cy="68" r="5" fill="url(#logoGoldGrad)" />
    </svg>
  );

  if (variant === 'mark') {
    return MarkSVG;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {MarkSVG}
      <div className="flex flex-col text-left select-none">
        <div className="flex items-center gap-1 leading-none">
          <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white font-sans">
            SPDSE
          </span>
          <span className="font-bold text-base tracking-tight text-accent dark:text-accent-dark font-sans">
            .Prep
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-mono font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            Infosys SP · DSE
          </span>
        </div>
      </div>
    </div>
  );
};
