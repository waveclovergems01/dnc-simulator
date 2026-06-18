import React from "react";

interface BrandFlameProps {
  height?: number;
}

const VB_WIDTH = 1000;
const VB_HEIGHT = 116;

// Build an organic flame silhouette across the full width.
const buildFlamePath = (
  step: number,
  baseY: number,
  tipMin: number,
  tipMax: number,
  seed: number,
): string => {
  let d = `M 0,${baseY} `;
  let x = 0;
  let i = 0;
  const range = tipMax - tipMin;
  while (x < VB_WIDTH) {
    const tipX = x + step / 2;
    // pseudo-random but deterministic tip height
    const tipY = tipMin + ((i * 53 + seed * 17) % range);
    const nextX = x + step;
    d += `C ${x + step * 0.2},${baseY - 28} ${tipX - 6},${tipY + 22} ${tipX},${tipY} `;
    d += `C ${tipX + 6},${tipY + 22} ${nextX - step * 0.2},${baseY - 28} ${nextX},${baseY} `;
    x = nextX;
    i += 1;
  }
  d += "Z";
  return d;
};

/**
 * Full-width black flame with indigo/cyan aura (SVG + feTurbulence).
 * Spans the entire Topbar behind its content.
 */
const BrandFlame: React.FC<BrandFlameProps> = ({ height = VB_HEIGHT }) => {
  const backPath = buildFlamePath(58, VB_HEIGHT, 18, 70, 3);
  const mainPath = buildFlamePath(46, VB_HEIGHT, 26, 78, 7);
  const corePath = buildFlamePath(52, VB_HEIGHT, 44, 88, 11);

  const embers = Array.from({ length: 16 }, (_, i) => {
    const cx = 30 + i * 62;
    return {
      cx,
      dur: `${4.6 + ((i * 7) % 26) / 10}s`,
      delay: `${((i * 13) % 30) / 10}s`,
      drift: i % 2 === 0 ? 7 : -6,
    };
  });

  return (
    <svg
      className="brand-flame-svg"
      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        height: `${(height / VB_HEIGHT) * 158}%`,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="bf-aura" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0" />
          <stop offset="28%" stopColor="#1e3a8a" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="bf-body" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#03040a" stopOpacity="0.88" />
          <stop offset="78%" stopColor="#070d22" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0b1733" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="bf-base" cx="50%" cy="100%" r="75%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <filter id="bf-flow" x="-10%" y="-40%" width="120%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" result="noise">
          <animate attributeName="baseFrequency" dur="18s" values="0.012 0.026; 0.015 0.038; 0.012 0.026" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="1.2" />
      </filter>

      <filter id="bf-flow-soft" x="-15%" y="-50%" width="130%" height="200%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.022" numOctaves="2" seed="9" result="noise2">
          <animate attributeName="baseFrequency" dur="22s" values="0.009 0.02; 0.012 0.03; 0.009 0.02" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise2" scale="28" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="5" />
      </filter>

      {/* Glowing base spanning the full width */}
      <ellipse cx={VB_WIDTH / 2} cy="112" rx={VB_WIDTH / 2} ry="14" fill="url(#bf-base)" style={{ mixBlendMode: "screen" }}>
        <animate attributeName="ry" values="13;17;13" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="5s" repeatCount="indefinite" />
      </ellipse>

      {/* Aura glow */}
      <g filter="url(#bf-flow-soft)" style={{ mixBlendMode: "screen" }} opacity="0.9">
        <path d={backPath} fill="url(#bf-aura)" />
      </g>

      {/* Black flame body */}
      <g filter="url(#bf-flow)">
        <path d={mainPath} fill="url(#bf-body)" />
      </g>

      {/* Inner core */}
      <g filter="url(#bf-flow)">
        <path d={corePath} fill="url(#bf-body)" opacity="0.7" />
      </g>

      {/* Rising embers across the width */}
      {embers.map((e, i) => (
        <circle key={i} cx={e.cx} cy="104" r="1.6" fill="#a5f3fc" style={{ mixBlendMode: "screen" }}>
          <animate attributeName="cy" values="104;14" dur={e.dur} begin={e.delay} repeatCount="indefinite" />
          <animate attributeName="cx" values={`${e.cx};${e.cx + e.drift}`} dur={e.dur} begin={e.delay} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0.85;0" keyTimes="0;0.15;0.7;1" dur={e.dur} begin={e.delay} repeatCount="indefinite" />
          <animate attributeName="r" values="1.8;0.3" dur={e.dur} begin={e.delay} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
};

export default BrandFlame;
