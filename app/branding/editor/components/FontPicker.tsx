"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { EDITOR_FONTS, type FontCategory } from "@/app/constants/editorFonts";
import { loadGoogleFont, loadPickerFonts } from "@/lib/fontLoader";

type CategoryFilter = FontCategory | "all";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all",     label: "All"     },
  { id: "serif",   label: "Serif"   },
  { id: "sans",    label: "Sans"    },
  { id: "display", label: "Display" },
  { id: "mono",    label: "Mono"    },
  { id: "script",  label: "Script"  },
];

const CATEGORY_COLORS: Record<FontCategory, { bg: string; text: string }> = {
  serif:   { bg: "#fef3c7", text: "#92400e" },
  sans:    { bg: "#dbeafe", text: "#1e40af" },
  display: { bg: "#f3e8ff", text: "#6b21a8" },
  mono:    { bg: "#d1fae5", text: "#065f46" },
  script:  { bg: "#fce7f3", text: "#9d174d" },
};

interface FontPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function FontPicker({ label, value, onChange }: FontPickerProps) {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const listRef                  = useRef<HTMLDivElement>(null);

  // On mount: batch-load all non-preloaded fonts with a character subset
  // so we can show each font name rendered in its own typeface.
  useEffect(() => {
    const families = EDITOR_FONTS
      .filter((f) => !f.preloaded)
      .map((f) => f.googleFamily);
    loadPickerFonts(families);
  }, []);

  // When the current value changes (e.g. initial load), ensure full font is loaded
  useEffect(() => {
    if (value) loadGoogleFont(value);
  }, [value]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EDITOR_FONTS.filter((f) => {
      const matchesCat  = category === "all" || f.category === category;
      const matchesText = !q || f.name.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });
  }, [search, category]);

  // Scroll active item into view whenever value, category, or search changes
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    if (active) {
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [value, category, search]);

  return (
    <div>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "#6b75a3",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {label}
      </span>

      {/* ── Search ────────────────────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        <svg
          aria-hidden
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b75a3"
          strokeWidth="2"
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search fonts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`Search ${label}`}
          style={{
            width: "100%",
            boxSizing: "border-box",
            paddingLeft: 30,
            paddingRight: 10,
            height: 34,
            borderRadius: 8,
            border: "1px solid #eef0f7",
            fontSize: 12.5,
            color: "#0b1020",
            background: "#f7f8fc",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#6873ff";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(104,115,255,0.12)";
            e.currentTarget.style.background = "white";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#eef0f7";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#f7f8fc";
          }}
        />
      </div>

      {/* ── Category chips ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          scrollbarWidth: "none",
          marginBottom: 8,
          paddingBottom: 2,
        }}
      >
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              style={{
                flexShrink: 0,
                padding: "4px 10px",
                borderRadius: 99,
                border: `1px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                background: active ? "#3b46e0" : "white",
                color: active ? "white" : "#6b75a3",
                fontSize: 11.5,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.12s",
                fontFamily: "inherit",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Font list ─────────────────────────────────────────── */}
      <div
        ref={listRef}
        style={{
          maxHeight: 230,
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#d6dae9 transparent",
          borderRadius: 10,
          border: "1px solid #eef0f7",
          background: "white",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", fontSize: 12.5, color: "#a8aecb" }}>
            No fonts match &ldquo;{search}&rdquo;
          </div>
        ) : (
          filtered.map((font) => {
            const active = font.value === value;
            const catColors = CATEGORY_COLORS[font.category];
            return (
              <button
                key={font.id}
                type="button"
                data-active={active}
                onClick={() => {
                  onChange(font.value);
                  loadGoogleFont(font.value);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  border: "none",
                  borderBottom: "1px solid #f3f4f9",
                  background: active ? "#f0f1ff" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f7f8fc"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Checkmark */}
                <span
                  style={{
                    width: 14,
                    flexShrink: 0,
                    color: "#3b46e0",
                    visibility: active ? "visible" : "hidden",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>

                {/* Font name rendered in that font */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: active ? "#3b46e0" : "#0b1020",
                    fontFamily: `"${font.value}", ui-sans-serif, sans-serif`,
                    fontWeight: active ? 500 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {font.name}
                </span>

                {/* Category badge */}
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 9.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: catColors.bg,
                    color: catColors.text,
                  }}
                >
                  {font.category}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Current selection preview */}
      <div
        style={{
          marginTop: 8,
          padding: "8px 10px",
          background: "#f7f8fc",
          borderRadius: 8,
          fontSize: 11.5,
          color: "#6b75a3",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span aria-hidden style={{ color: "#a8aecb" }}>Aa</span>
        <span
          style={{
            fontFamily: `"${value}", ui-sans-serif, sans-serif`,
            fontSize: 13,
            color: "#0b1020",
            flex: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 10, color: "#a8aecb" }}>
          {EDITOR_FONTS.find((f) => f.value === value)?.category ?? "custom"}
        </span>
      </div>
    </div>
  );
}
