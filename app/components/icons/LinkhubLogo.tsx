import { useId } from "react";

const SIZES = {
  sm: { fontSize: 19, gap: 7, lockupRingH: 26 },
  md: { fontSize: 24, gap: 9, lockupRingH: 32 },
  lg: { fontSize: 30, gap: 12, lockupRingH: 40 },
} as const;

type LogoSize = keyof typeof SIZES;

/**
 * Interlocking chain-ring mark matching the brand PNG.
 *
 * Drawing order:
 *  1. Ring 2 (lower-right) with white fill  → appears behind ring 1 at the overlap
 *  2. Ring 1 (upper-left)  with white fill  → white fill covers ring 2's stroke at the upper overlap
 *  3. Ring 2 again, NO fill, clipped to lower-right half → redraws ring 2's front portion on top of ring 1
 *
 * The clip polygon is the half-plane on ring 2's side of the two intersection points (the chord).
 */
function ChainRings({ h }: { h: number }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `lh-r2f-${uid}`;

  const r   = h * 0.31;
  const off = r * 0.90;           // diagonal offset between the two centres
  const x1 = r + 1.5, y1 = r + 1.5;
  const x2 = x1 + off, y2 = y1 + off;
  const sw  = r * 0.33;           // stroke width ~33 % of radius — matches PNG thickness
  const W   = x2 + r + 1.5;
  const H   = y2 + r + 1.5;
  const color = "#6b75a3";

  // ── intersection chord of the two equal circles ─────────────────────────────
  const d    = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const a    = d / 2;
  const hInt = Math.sqrt(Math.max(0, r * r - a * a));
  const mx   = (x1 + x2) / 2;
  const my   = (y1 + y2) / 2;

  // perpendicular to the line between centres
  const perpX = -(y2 - y1) / d;
  const perpY =  (x2 - x1) / d;

  // the two intersection points (chord endpoints)
  const p1x = mx + hInt * perpX,  p1y = my + hInt * perpY;  // lower-left of chord
  const p2x = mx - hInt * perpX,  p2y = my - hInt * perpY;  // upper-right of chord

  // clip polygon: lower-right half-plane (where ring 2 appears in front of ring 1)
  // visits: p1 → bottom-left → bottom-right → top-right → p2  (clockwise in screen coords)
  const m = 2;
  const clipPts = [
    `${p1x.toFixed(1)},${p1y.toFixed(1)}`,
    `${(-m).toFixed(1)},${(H + m).toFixed(1)}`,
    `${(W + m).toFixed(1)},${(H + m).toFixed(1)}`,
    `${(W + m).toFixed(1)},${(-m).toFixed(1)}`,
    `${p2x.toFixed(1)},${p2y.toFixed(1)}`,
  ].join(" ");

  const f = (n: number) => n.toFixed(1);

  return (
    <svg
      width={Math.ceil(W)} height={Math.ceil(H)}
      viewBox={`0 0 ${f(W)} ${f(H)}`}
      fill="none" aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={clipPts} />
        </clipPath>
      </defs>

      {/* 1 — ring 2 behind */}
      <circle cx={f(x2)} cy={f(y2)} r={f(r)} fill="white" stroke={color} strokeWidth={f(sw)} />
      {/* 2 — ring 1 in front (white fill covers ring 2 at the upper-left overlap) */}
      <circle cx={f(x1)} cy={f(y1)} r={f(r)} fill="white" stroke={color} strokeWidth={f(sw)} />
      {/* 3 — ring 2 front half redrawn over ring 1 → creates the interlock */}
      <circle cx={f(x2)} cy={f(y2)} r={f(r)} fill="none"  stroke={color} strokeWidth={f(sw)} clipPath={`url(#${clipId})`} />
    </svg>
  );
}

export function LinkhubLogo({
  markOnly = false,
  size = "md",
}: {
  markOnly?: boolean;
  size?: LogoSize;
}) {
  const { fontSize, gap, lockupRingH } = SIZES[size];
  const textColor = "#4c62ea";
  const brushH  = Math.round(fontSize * 0.22);
  const brushMT = Math.round(fontSize * 0.06);

  if (markOnly) {
    return <ChainRings h={34} />;
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap }}>
      {/* Wordmark + brushstroke — text LEFT, rings RIGHT (matching PNG) */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <span
          style={{
            fontFamily: "var(--font-caveat, 'Caveat', cursive)",
            fontWeight: 700,
            fontSize,
            color: textColor,
            letterSpacing: "0.01em",
            lineHeight: 1.1,
            display: "block",
            userSelect: "none",
          }}
        >
          linkhub
        </span>
        {/* Brushstroke underline */}
        <svg
          style={{
            display: "block",
            width: "108%",
            marginLeft: "-4%",
            height: brushH,
            marginTop: brushMT,
          }}
          viewBox="0 0 108 8"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 1 6 C 28 3 60 7 107 5"
            stroke={textColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <ChainRings h={lockupRingH} />
    </div>
  );
}
