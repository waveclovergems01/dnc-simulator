import React from "react";

interface BrandFlameProps {
  width?: number;
  height?: number;
}

/**
 * Black flame with an indigo/cyan aura, rendered with SVG + feTurbulence.
 * - Aura layer (screen blend, cyan/blue glow) makes the dark flame visible.
 * - Body layer (normal blend, near-black gradient) is the black fire itself.
 * Turbulence is slow & low-scale so the edges flow instead of jittering.
 */
const BrandFlame: React.FC<BrandFlameProps> = ({ width = 300, height = 116 }) => {
  // Tall licking tongues — tips reach near the top of the viewBox.
  const flamePath =
    "M 18,116 C 26,78 30,86 36,26 C 42,84 48,76 56,40 C 60,86 70,80 80,8 " +
    "C 88,84 96,78 106,36 C 114,88 124,82 134,16 C 142,82 152,78 162,40 " +
    "C 168,86 178,80 188,12 C 196,84 206,80 216,34 C 222,86 232,82 242,24 " +
    "C 250,82 260,84 272,116 Z";

  const corePath =
    "M 70,116 C 80,76 86,82 96,30 C 104,86 114,80 124,44 C 132,88 142,82 152,22 " +
    "C 160,84 170,80 180,44 C 188,86 198,82 208,34 C 218,84 226,86 236,116 Z";

  return (
    <svg
      className="brand-flame-svg"
      width={width}
      height={height}
      viewBox="0 0 300 116"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-25%",
        bottom: 0,
        width: "150%",
        height: "158%",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "visible",
      }}
    >
      <defs>
        {/* Cyan/indigo aura behind the black flame */}
        <linearGradient id="bf-aura" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0" />
          <stop offset="28%" stopColor="#1e3a8a" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
        </linearGradient>

        {/* Near-black flame body, fading to transparent at the tips */}
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

      {/* Slow, gentle turbulence — low scale to avoid the shaky look */}
      <filter id="bf-flow" x="-30%" y="-40%" width="160%" height="180%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.014 0.03"
          numOctaves="2"
          seed="4"
          result="noise"
        >
          <animate
            attributeName="baseFrequency"
            dur="18s"
            values="0.014 0.026; 0.016 0.038; 0.014 0.026"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="20"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur stdDeviation="1.2" />
      </filter>

      {/* Wider, softer turbulence for the aura glow */}
      <filter id="bf-flow-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.022"
          numOctaves="2"
          seed="9"
          result="noise2"
        >
          <animate
            attributeName="baseFrequency"
            dur="22s"
            values="0.01 0.02; 0.013 0.03; 0.01 0.02"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise2"
          scale="28"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur stdDeviation="5" />
      </filter>

      {/* Glowing base */}
      <ellipse cx="150" cy="112" rx="135" ry="14" fill="url(#bf-base)" style={{ mixBlendMode: "screen" }}>
        <animate attributeName="rx" values="135;144;135" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="5s" repeatCount="indefinite" />
      </ellipse>

      {/* Aura glow (cyan/indigo) — screen blend so it lights up the dark bg */}
      <g filter="url(#bf-flow-soft)" style={{ mixBlendMode: "screen" }} opacity="0.95">
        <path d={flamePath} fill="url(#bf-aura)" />
      </g>

      {/* Black flame body — normal blend so the dark fire is visible */}
      <g filter="url(#bf-flow)">
        <path d={flamePath} fill="url(#bf-body)" />
      </g>

      {/* Inner darker core for depth */}
      <g filter="url(#bf-flow)">
        <path d={corePath} fill="url(#bf-body)" opacity="0.7" />
      </g>

      {/* Rising ember sparks (cyan) */}
      {[
        { cx: 60, delay: "0s", dur: "5.5s", drift: 6 },
        { cx: 110, delay: "1.8s", dur: "6.5s", drift: -7 },
        { cx: 150, delay: "0.9s", dur: "5s", drift: 8 },
        { cx: 196, delay: "2.6s", dur: "6s", drift: -5 },
        { cx: 234, delay: "0.4s", dur: "6.8s", drift: 6 },
      ].map((e, i) => (
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
