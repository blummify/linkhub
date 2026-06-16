"use client";

import { useMemo, useState } from "react";
import { HELP_FAQ_GROUPS, type FaqItem } from "../../../constants/helpLinks";
import { HELP_COLORS, CARD_STYLE, highlight, matchesQuery } from "./helpTheme";
import { SectionLabel } from "./SectionLabel";
import { HelpIcon, ChevronDownIcon } from "./helpIcons";

function matchesItem(item: FaqItem, query: string) {
  return matchesQuery(`${item.question} ${item.answer}`, query);
}

function FaqRow({
  item,
  query,
  open,
  onToggle,
}: {
  item: FaqItem;
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  const bodyId = `faq-${item.id}`;
  return (
    <div
      style={{
        ...CARD_STYLE,
        borderRadius: 12,
        overflow: "hidden",
        borderColor: open ? HELP_COLORS.borderStrong : HELP_COLORS.border,
        boxShadow: open ? "0 1px 2px rgba(24,27,39,0.05)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          background: "none",
          border: "none",
          fontFamily: "inherit",
          fontSize: 15,
          fontWeight: 600,
          color: HELP_COLORS.text,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ flex: 1 }}>{highlight(item.question, query)}</span>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: open ? HELP_COLORS.accentSoft : HELP_COLORS.surface2,
            color: open ? HELP_COLORS.accent : HELP_COLORS.text3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s, background 0.15s, color 0.15s",
          }}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>
      {open && (
        <div
          id={bodyId}
          style={{
            padding: "0 18px 17px 58px",
            color: HELP_COLORS.text2,
            fontSize: 14.5,
            lineHeight: 1.6,
          }}
        >
          {highlight(item.answer, query)}
        </div>
      )}
    </div>
  );
}

/** Grouped FAQ accordion with live search filtering, highlighting, and empty state. */
export function FaqSection({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;
  const [manualOpen, setManualOpen] = useState<Set<string>>(new Set());

  const groups = useMemo(
    () =>
      HELP_FAQ_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((it) => matchesItem(it, q)),
      })).filter((g) => g.items.length > 0),
    [q]
  );

  const visibleCount = groups.reduce((n, g) => n + g.items.length, 0);
  const totalCount = HELP_FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0);

  const toggle = (id: string) =>
    setManualOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section>
      <SectionLabel count={isSearching ? `${visibleCount} matches` : `${totalCount} answers`}>
        Frequently asked
      </SectionLabel>

      {groups.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: HELP_COLORS.text2,
            background: HELP_COLORS.surface,
            border: `1px dashed ${HELP_COLORS.borderStrong}`,
            borderRadius: 14,
          }}
        >
          <div style={{ fontWeight: 600, color: HELP_COLORS.text, marginBottom: 4 }}>
            No results found
          </div>
          <div>Try a different keyword, or contact support.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {groups.map((group) => (
            <div key={group.id}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: HELP_COLORS.text,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                <span style={{ color: HELP_COLORS.accent, display: "flex" }}>
                  <HelpIcon name={group.icon} size={16} />
                </span>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {group.items.map((item) => (
                  <FaqRow
                    key={item.id}
                    item={item}
                    query={query}
                    open={isSearching || manualOpen.has(item.id)}
                    onToggle={() => toggle(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
