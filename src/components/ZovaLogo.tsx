import React from 'react';

interface ZovaShieldIconProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

/**
 * Official ZOVA Shield Symbol
 * Features: Charcoal container, faceted protective shield silhouette,
 * stylized dynamic 'Z' core, and radiant teal-to-emerald gradient.
 */
export const ZovaShieldIcon: React.FC<ZovaShieldIconProps> = ({
  className = 'w-9 h-9',
  size,
  showGlow = true,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      style={style}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-[#111827] border border-[#064E3B] ${
        showGlow ? 'shadow-md shadow-[#10B981]/25 ring-1 ring-[#10B981]/30' : ''
      } p-1.5 transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Teal to Emerald Brand Gradient */}
          <linearGradient id="zovaTealToEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="45%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Deep Charcoal Surface Gradient */}
          <linearGradient id="zovaCharcoal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>

          {/* Inner Accent Glow */}
          <radialGradient id="zovaGlow" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>

          {/* Shield Bevel Linear Gradient */}
          <linearGradient id="zovaShieldRim" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>

        {/* Ambient Glow behind shield */}
        <ellipse cx="24" cy="24" rx="16" ry="16" fill="url(#zovaGlow)" />

        {/* Outer Protective Shield Geometry */}
        <path
          d="M24 5L8 11V23C8 32.5 14.8 41.3 24 43.5C33.2 41.3 40 32.5 40 23V11L24 5Z"
          fill="url(#zovaCharcoal)"
          stroke="url(#zovaShieldRim)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Shield Facet Shading (Left side subtle contrast) */}
        <path
          d="M24 5.5L9.5 11.2V23C9.5 31.8 15.8 40 24 42.2V5.5Z"
          fill="#10B981"
          fillOpacity="0.08"
        />

        {/* Center Stylized 'Z' Protective Emblem */}
        <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
          {/* Top Bar of 'Z' */}
          <path
            d="M17 17.5H30.5C31.3 17.5 31.8 18.3 31.4 19L29 22.5H19C17.9 22.5 17 21.6 17 20.5V17.5Z"
            fill="url(#zovaTealToEmerald)"
          />

          {/* Dynamic Diagonal Slash of 'Z' */}
          <path
            d="M29.5 20.5L18.5 30H23.5L32 20.5H29.5Z"
            fill="url(#zovaTealToEmerald)"
          />

          {/* Bottom Bar of 'Z' */}
          <path
            d="M17.5 28.5L16.2 30.5C15.8 31.2 16.3 32 17.1 32H31V28.5H17.5Z"
            fill="url(#zovaTealToEmerald)"
          />

          {/* Central Apex Core Dot / Star Accent */}
          <circle cx="24" cy="24.5" r="1.5" fill="#F9FAFB" />
        </g>
      </svg>
    </div>
  );
};

interface ZovaLogoProps {
  variant?: 'navbar' | 'full' | 'hero' | 'compact';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Official ZOVA Brand Identity Component
 * Incorporates the ZOVA shield symbol, teal-to-emerald gradient,
 * charcoal background, and official tagline "Safer Campus. Stronger You."
 */
export const ZovaLogo: React.FC<ZovaLogoProps> = ({
  variant = 'navbar',
  showTagline = true,
  className = '',
  onClick,
}) => {
  const isHero = variant === 'hero';
  const isFull = variant === 'full';
  const isCompact = variant === 'compact';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* ZOVA Shield Symbol */}
      <ZovaShieldIcon
        className={
          isHero
            ? 'w-16 h-16 sm:w-20 sm:h-20 shadow-xl shadow-[#10B981]/30'
            : isFull
            ? 'w-12 h-12 shadow-lg shadow-[#10B981]/20'
            : isCompact
            ? 'w-8 h-8'
            : 'w-10 h-10 group-hover:scale-105 transition-transform'
        }
      />

      {/* Brand Typography & Tagline */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#F9FAFB] ${
              isHero
                ? 'text-4xl sm:text-5xl tracking-widest'
                : isFull
                ? 'text-2xl sm:text-3xl tracking-widest'
                : isCompact
                ? 'text-base font-extrabold tracking-wide'
                : 'text-xl font-extrabold tracking-wider text-[#F9FAFB]'
            }`}
          >
            ZOVA
          </span>
          {!isCompact && (
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-[#064E3B] text-[#10B981] border border-[#10B981]/30">
              CAMPUS SHIELD
            </span>
          )}
        </div>

        {showTagline && (
          <span
            className={`font-medium tracking-tight ${
              isHero
                ? 'text-sm sm:text-base text-slate-300 mt-1 font-semibold'
                : isFull
                ? 'text-xs text-slate-300 mt-0.5'
                : isCompact
                ? 'text-[10px] text-slate-400'
                : 'text-[11px] text-slate-300 font-medium hidden sm:block'
            }`}
          >
            Safer Campus. Stronger You.
          </span>
        )}
      </div>
    </div>
  );
};
