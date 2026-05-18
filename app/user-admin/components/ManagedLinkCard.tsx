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
  website:   { Icon: TbWorld,     bg: "bg-blue-50",   color: "text-blue-500"  },
  instagram: { Icon: SiInstagram, bg: "bg-pink-50",   color: "text-pink-500"  },
  youtube:   { Icon: SiYoutube,   bg: "bg-red-50",    color: "text-red-500"   },
  twitter:   { Icon: SiX,         bg: "bg-gray-100",  color: "text-gray-700"  },
  spotify:   { Icon: SiSpotify,   bg: "bg-green-50",  color: "text-green-600" },
  behance:   { Icon: SiBehance,   bg: "bg-blue-100",  color: "text-blue-600"  },
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

  return (
    <div
      className={`group relative flex overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-sm transition-all duration-150 hover:bg-[#f8f8ff] hover:shadow-md dark:border-outline-variant/30 dark:bg-surface-container-lowest ${
        draft ? "opacity-[0.92]" : ""
      } ${isOverlay ? "shadow-2xl rotate-[0.5deg] scale-[1.01]" : ""}`}
    >
      {/* Left accent border — published only */}
      {!draft && (
        <div
          className="w-[3px] shrink-0 self-stretch"
          style={{ backgroundColor: "#5B4FF5" }}
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 gap-3 p-4 sm:gap-4 sm:p-5">
        {/* Drag handle */}
        <div
          {...dragHandleListeners}
          {...dragHandleAttributes}
          className={`mt-1 flex shrink-0 flex-col items-center justify-start text-on-surface-variant/35 transition-colors group-hover:text-on-surface-variant/60 ${
            isOverlay ? "cursor-grabbing" : "cursor-grab"
          }`}
          aria-label="Drag to reorder"
        >
          <span className="material-symbols-outlined text-[20px] select-none">drag_indicator</span>
        </div>

        {/* Platform icon */}
        <div
          className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            iconEntry?.bg ?? "bg-surface-container-high"
          }`}
        >
          {iconEntry ? (
            <iconEntry.Icon className={`text-[18px] ${iconEntry.color}`} />
          ) : (
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">link</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              {/* Sample badge */}
              {isDemo && (
                <span className="mb-0.5 inline-flex rounded-md bg-primary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary-container">
                  Sample
                </span>
              )}

              {/* Title + status badge */}
              <div className="flex items-center gap-2 min-w-0">
                {editingField === "title" ? (
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                    className="min-w-0 flex-1 border-b border-primary/40 bg-transparent text-base font-semibold tracking-tight text-on-surface outline-none dark:border-primary/50"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingField("title")}
                    className="min-w-0 flex-1 text-left"
                  >
                    <h3 className="truncate text-base font-semibold tracking-tight text-on-surface">
                      {title}
                    </h3>
                  </button>
                )}

                {draft ? (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                    Draft
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
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
                  className="w-full border-b border-primary/30 bg-transparent text-sm font-medium text-primary outline-none dark:border-primary/40"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField("url")}
                  className={`block w-full truncate text-left text-sm font-medium underline-offset-2 hover:underline ${
                    draft ? "italic text-on-surface-variant" : "text-primary"
                  }`}
                >
                  {url}
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Toggle switch */}
              {onToggle ? (
                <button
                  type="button"
                  onClick={onToggle}
                  title={draft ? "Publish link" : "Mark as draft"}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary ${
                    draft ? "bg-surface-container-high" : "bg-[#5B4FF5]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ${
                      draft ? "translate-x-1" : "translate-x-6"
                    }`}
                  />
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => (onEdit ? onEdit() : setEditingField("title"))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-150 hover:bg-primary/10 hover:text-primary cursor-pointer"
                title="Edit"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete?.()}
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-150 hover:bg-error/10 hover:text-error cursor-pointer"
                aria-label={`Delete ${title}`}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>

          {/* Stats row */}
          {showStats && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">visibility</span>
                <span className="font-medium">{clicks} clicks</span>
              </span>
              {trendLabel ? (
                <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  {trendLabel}
                </span>
              ) : null}
              {createdAt ? (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">calendar_today</span>
                  <span className="font-medium">{draft ? "Created" : "Added"} {createdAt}</span>
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
