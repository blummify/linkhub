import type { CSSProperties, ReactNode } from "react";

/**
 * Help-page design tokens, adapted from the standalone mockup to the app's
 * light dashboard palette (the dashboard is light-only by product design — see
 * ThemeToggle's DASHBOARD_PREFIXES). Centralized so every section card matches.
 */
export const HELP_COLORS = {
  bg: "#f7f8fc",
  surface: "#ffffff",
  surface2: "#fafbfc",
  surfaceHover: "#f4f6fc",
  border: "#eef0f7",
  borderStrong: "#d6dae9",
  text: "#0b1020",
  text2: "#3a4474",
  text3: "#6b75a3",
  accent: "#3b46e0",
  accentHover: "#2f39c4",
  accentSoft: "#eef0ff",
  grad: "linear-gradient(150deg, #5b4ae6 0%, #7b46e0 58%, #8f44d8 100%)",
} as const;

export const CARD_STYLE: CSSProperties = {
  background: HELP_COLORS.surface,
  border: `1px solid ${HELP_COLORS.border}`,
  borderRadius: 14,
};

export const SECTION_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: HELP_COLORS.text3,
  margin: "44px 0 16px",
  display: "flex",
  alignItems: "baseline",
  gap: 10,
};

/** Escapes a user-typed term for safe use inside a RegExp. */
export function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whitespace-separated, case-insensitive search tokens (e.g. "change theme" → ["change","theme"]). */
export function queryTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** True when every token in `query` appears somewhere in `haystack` (AND match). */
export function matchesQuery(haystack: string, query: string): boolean {
  const tokens = queryTokens(query);
  if (!tokens.length) return true;
  const hay = haystack.toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

/**
 * Wraps each matching query token in `text` with <mark>. Returns the raw string
 * when there's no query so callers can render plain text.
 */
export function highlight(text: string, query: string): ReactNode {
  const tokens = queryTokens(query).map(escapeRegExp);
  if (!tokens.length) return text;
  const isToken = new RegExp(`^(?:${tokens.join("|")})$`, "i");
  const parts = text.split(new RegExp(`(${tokens.join("|")})`, "ig"));
  return parts.map((part, i) =>
    part && isToken.test(part) ? (
      <mark
        key={i}
        style={{
          background: HELP_COLORS.accentSoft,
          color: HELP_COLORS.accent,
          padding: "0 2px",
          borderRadius: 3,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}
