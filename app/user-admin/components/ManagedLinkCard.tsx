"use client";

import { useState, useEffect } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { isDemoManagedLink } from "@/lib/demoManagedLinks";
import type { ManagedLink } from "./types";
import { SiInstagram, SiYoutube, SiSpotify, SiX, SiBehance } from "react-icons/si";
import { TbWorld } from "react-icons/tb";

export interface ManagedLinkCardProps {
  link: ManagedLink;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onUpdate?: (updates: Partial<ManagedLink>) => void;
  dragHandleListeners?: DraggableSyntheticListeners;
  dragHandleAttributes?: DraggableAttributes;
  isOverlay?: boolean;
}

const ICON_MAP = {
  website:   { Icon: TbWorld,     bgColor: "#eff6ff", textColor: "#3b82f6"  },
  instagram: { Icon: SiInstagram, bgColor: "#fdf2f8", textColor: "#ec4899"  },
  youtube:   { Icon: SiYoutube,   bgColor: "#fef2f2", textColor: "#ef4444"  },
  twitter:   { Icon: SiX,         bgColor: "#f3f4f6", textColor: "#374151"  },
  spotify:   { Icon: SiSpotify,   bgColor: "#f0fdf4", textColor: "#16a34a"  },
  behance:   { Icon: SiBehance,   bgColor: "#e9f3ff", textColor: "#1565d8"  },
} as const;

type IconKey = keyof typeof ICON_MAP;

function detectIconKey(url: string): IconKey | undefined {
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/behance\.net/i.test(url)) return "behance";
  if (/youtube\.com/i.test(url)) return "youtube";
  if (/x\.com|twitter\.com/i.test(url)) return "twitter";
  if (/spotify\.com/i.test(url)) return "spotify";
  return undefined;
}

function RowBtn({
  children,
  title,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 0,
        background: hovered ? (danger ? "#fde8ec" : "#eef0f7") : "transparent",
        color: hovered ? (danger ? "#e11d48" : "#0b1020") : "#6b75a3",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export function ManagedLinkCard({
  link,
  onEdit,
  onDelete,
  onToggle,
  onUpdate,
  dragHandleListeners,
  dragHandleAttributes,
  isOverlay = false,
}: ManagedLinkCardProps) {
  const { title, url, clicks, draft, trendLabel, createdAt } = link;
  const isDemo = isDemoManagedLink(link);
  const [editingField, setEditingField] = useState<"title" | "url" | null>(null);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempUrl, setTempUrl] = useState(url);
  const [isHovered, setIsHovered] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTempTitle(title);
    setTempUrl(url);
  }, [title, url]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTitleSubmit = () => {
    if (tempTitle !== title && tempTitle.trim()) {
      onUpdate?.({ title: tempTitle });
    } else {
      setTempTitle(title);
    }
    setEditingField(null);
  };

  const handleUrlSubmit = () => {
    if (tempUrl !== url && tempUrl.trim()) {
      onUpdate?.({ url: tempUrl });
    } else {
      setTempUrl(url);
    }
    setEditingField(null);
  };

  const showStats = !draft || Number(String(clicks).replace(/,/g, "")) > 0;
  const iconKey = (link.icon && link.icon in ICON_MAP)
    ? (link.icon as IconKey)
    : detectIconKey(link.url);
  const iconEntry = iconKey ? ICON_MAP[iconKey] : undefined;

  const cardBoxShadow = isOverlay
    ? "0 20px 40px -8px rgba(15,23,42,0.18)"
    : draft
    ? "inset 3px 0 0 #d6dae9"
    : "inset 3px 0 0 #3b46e0";

  const hoverBoxShadow = draft
    ? "inset 3px 0 0 #d6dae9, 0 4px 14px -4px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)"
    : "inset 3px 0 0 #3b46e0, 0 4px 14px -4px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)";

  return (
    <div
      className={`group relative flex transition-all duration-200 ${isOverlay ? "rotate-[0.5deg] scale-[1.01]" : ""}`}
      style={{
        background: "white",
        border: `1px solid ${isHovered ? "#d6dae9" : "#eef0f7"}`,
        borderRadius: 16,
        padding: "16px 16px 16px 14px",
        boxShadow: isOverlay ? "0 20px 40px -8px rgba(15,23,42,0.18)" : isHovered ? hoverBoxShadow : cardBoxShadow,
        transform: isHovered && !isOverlay ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-[14px]">
        {/* Drag handle */}
        <div
          {...dragHandleListeners}
          {...dragHandleAttributes}
          className={`flex shrink-0 items-start justify-center pt-1 transition-colors ${
            isOverlay ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ color: isHovered ? "#6b75a3" : "#a8aecb" }}
          aria-label="Drag to reorder"
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <circle cx="2" cy="2" r="1.2" fill="currentColor"/>
            <circle cx="8" cy="2" r="1.2" fill="currentColor"/>
            <circle cx="2" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="8" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="2" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="8" cy="12" r="1.2" fill="currentColor"/>
          </svg>
        </div>

        {/* Platform icon */}
        <div
          className="shrink-0 flex items-center justify-center mt-0.5"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: iconEntry ? iconEntry.bgColor : "linear-gradient(135deg,#eef1ff,#dbe2ff)",
            color: iconEntry ? iconEntry.textColor : "#2a37c0",
          }}
        >
          {iconEntry ? (
            <iconEntry.Icon style={{ fontSize: 18, color: iconEntry.textColor }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Title + status tag */}
              <div className="flex items-center gap-2 min-w-0">
                {editingField === "title" ? (
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                    className="min-w-0 flex-1 border-b bg-transparent outline-none font-semibold"
                    style={{ fontSize: 15, color: "#0b1020", borderBottomColor: "#6873ff" }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingField("title")}
                    className="min-w-0 shrink truncate text-left"
                    style={{ fontSize: 15, fontWeight: 600, color: "#0b1020", letterSpacing: "-0.01em" }}
                  >
                    {title}
                  </button>
                )}

                {!draft && (
                  <span
                    className="shrink-0 uppercase"
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      padding: "2.5px 7px",
                      borderRadius: 5,
                      background: "#e8f6ee",
                      color: "#16a34a",
                    }}
                  >
                    Published
                  </span>
                )}
              </div>

              {/* URL */}
              {editingField === "url" ? (
                <input
                  autoFocus
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  onBlur={handleUrlSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  className="w-full bg-transparent outline-none border-b"
                  style={{ fontSize: 13, color: "#3b46e0", borderBottomColor: "#6873ff", fontFamily: "monospace" }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField("url")}
                  className="block max-w-full truncate text-left hover:underline underline-offset-2"
                  style={{
                    fontSize: 13,
                    color: "#6b75a3",
                    fontFamily: "monospace",
                  }}
                >
                  {url}
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Toggle / Draft pill */}
              {onToggle ? (
                draft ? (
                  <button
                    type="button"
                    onClick={onToggle}
                    title="Click to publish"
                    className="cursor-pointer transition-all duration-150 mr-2 uppercase hover:opacity-80"
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      padding: "4px 10px",
                      borderRadius: 99,
                      background: "#eef0f7",
                      color: "#3a4474",
                      border: 0,
                    }}
                  >
                    Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onToggle}
                    title="Mark as draft"
                    className="relative shrink-0 cursor-pointer outline-none transition-colors duration-200 mr-2"
                    style={{
                      width: 38,
                      height: 22,
                      borderRadius: 99,
                      background: "#3b46e0",
                      border: 0,
                    }}
                  >
                    <span
                      className="absolute rounded-full bg-white transition-transform duration-200"
                      style={{
                        width: 18,
                        height: 18,
                        top: 2,
                        left: 2,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        transform: "translateX(16px)",
                      }}
                    />
                  </button>
                )
              ) : null}

              <RowBtn
                title="Edit"
                onClick={() => (onEdit ? onEdit() : setEditingField("title"))}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/>
                </svg>
              </RowBtn>

              <RowBtn
                title={`Delete ${title}`}
                danger
                onClick={() => onDelete?.()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </RowBtn>
            </div>
          </div>

          {/* Stats row */}
          {showStats && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2" style={{ fontSize: 12, color: "#6b75a3" }}>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {clicks} clicks
              </span>
              {trendLabel ? (
                <span className="flex items-center gap-1.5 font-medium" style={{ color: "#16a34a" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 4 4 6-7"/>
                  </svg>
                  {trendLabel}
                </span>
              ) : null}
              {createdAt ? (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {draft ? "Created" : "Added"} {createdAt}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
