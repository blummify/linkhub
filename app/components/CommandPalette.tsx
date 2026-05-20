"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ManagedLink } from "../user-admin/components/types";

const NAV_ITEMS = [
  { label: "Links",      href: "/user-dashboard", icon: "links"      },
  { label: "Appearance", href: "/appearance",      icon: "appearance" },
  { label: "Analytics",  href: "/user-analytics",  icon: "analytics"  },
  { label: "Audience",   href: "/audience",         icon: "audience"   },
  { label: "Settings",   href: "/settings",         icon: "settings"   },
];

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  links?: ManagedLink[];
  onAddLink?: () => void;
}

function NavIcon({ type }: { type: string }) {
  if (type === "links") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  );
  if (type === "appearance") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
  if (type === "analytics") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  );
  if (type === "audience") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#f1f3ff", color: "#3b46e0", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CommandPalette({ open, onClose, links = [], onAddLink }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const buildItems = useCallback((): PaletteItem[] => {
    const q = query.toLowerCase();

    const quickActions: PaletteItem[] = [
      {
        id: "add-link",
        label: "Add new link",
        group: "Quick actions",
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
          </svg>
        ),
        action: () => { onAddLink?.(); onClose(); },
      },
    ].filter(item => !q || item.label.toLowerCase().includes(q));

    const navItems: PaletteItem[] = NAV_ITEMS
      .filter(n => !q || n.label.toLowerCase().includes(q))
      .map(n => ({
        id: `nav-${n.href}`,
        label: n.label,
        group: "Navigate",
        icon: <NavIcon type={n.icon} />,
        action: () => { router.push(n.href); onClose(); },
      }));

    const linkItems: PaletteItem[] = links
      .filter(l => !q || l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q))
      .slice(0, 6)
      .map(l => ({
        id: `link-${l.id ?? l.url}`,
        label: l.title,
        description: l.url.replace(/^https?:\/\//, ""),
        group: "Links",
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        ),
        action: () => { window.open(l.url, "_blank", "noopener,noreferrer"); onClose(); },
      }));

    return [...quickActions, ...navItems, ...linkItems];
  }, [query, links, onAddLink, onClose, router]);

  const items = buildItems();

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, items.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && items[activeIndex]) {
      items[activeIndex].action();
    }
  };

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  // Group items
  const groups: { group: string; items: (PaletteItem & { flatIndex: number })[] }[] = [];
  let flatIndex = 0;
  for (const item of items) {
    const g = groups.find(g => g.group === item.group);
    const entry = { ...item, flatIndex: flatIndex++ };
    if (g) g.items.push(entry);
    else groups.push({ group: item.group, items: [entry] });
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center"
      style={{ paddingTop: "13vh", background: "rgba(11,16,32,0.55)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full mx-4 overflow-hidden flex flex-col"
        style={{
          maxWidth: 560,
          background: "white",
          borderRadius: 18,
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.45), 0 16px 32px -16px rgba(15,23,42,0.25)",
          animation: "cpIn 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
        onKeyDown={handleKeyDown}
      >
        <style>{`
          @keyframes cpIn {
            from { opacity: 0; transform: translateY(-12px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Search header */}
        <div
          className="flex items-center gap-3"
          style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f7" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b75a3" strokeWidth="2" className="shrink-0">
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search links, pages, actions…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#0b1020" }}
          />
          <kbd
            onClick={onClose}
            className="cursor-pointer"
            style={{
              fontSize: 11,
              color: "#6b75a3",
              padding: "3px 7px",
              borderRadius: 6,
              background: "#eef0f7",
              border: "1px solid #d6dae9",
              borderBottomWidth: 2,
              fontFamily: "monospace",
            }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 380 }} ref={listRef}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: "#6b75a3" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 10, opacity: 0.5 }}>
                <circle cx="11" cy="11" r="8"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <p style={{ fontSize: 14 }}>No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            groups.map(({ group, items: groupItems }) => (
              <div key={group}>
                <p
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#6b75a3",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "10px 16px 4px",
                  }}
                >
                  {group}
                </p>
                {groupItems.map(item => {
                  const isActive = item.flatIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(item.flatIndex)}
                      className="w-full flex items-center gap-3 text-left transition-colors"
                      style={{
                        padding: "9px 16px",
                        background: isActive ? "#f1f3ff" : "transparent",
                        border: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        className="shrink-0 flex items-center justify-center"
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: isActive ? "#eaeefb" : "#f7f8fc",
                          color: isActive ? "#3b46e0" : "#6b75a3",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className="block truncate"
                          style={{ fontSize: 14, fontWeight: 500, color: isActive ? "#1e2a8a" : "#0b1020" }}
                        >
                          {highlight(item.label, query)}
                        </span>
                        {item.description && (
                          <span
                            className="block truncate"
                            style={{ fontSize: 12, color: "#6b75a3", marginTop: 1 }}
                          >
                            {item.description}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <kbd
                          style={{
                            fontSize: 10,
                            color: "#3b46e0",
                            padding: "2px 6px",
                            borderRadius: 5,
                            background: "#eaeefb",
                            border: "1px solid #c5ccf5",
                            borderBottomWidth: 2,
                            fontFamily: "monospace",
                            flexShrink: 0,
                          }}
                        >
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center gap-4"
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #eef0f7",
            fontSize: 11,
            color: "#a8aecb",
          }}
        >
          <span className="flex items-center gap-1">
            <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "#f7f8fc", border: "1px solid #eef0f7", fontFamily: "monospace" }}>↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "#f7f8fc", border: "1px solid #eef0f7", fontFamily: "monospace" }}>↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "#f7f8fc", border: "1px solid #eef0f7", fontFamily: "monospace" }}>Esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
