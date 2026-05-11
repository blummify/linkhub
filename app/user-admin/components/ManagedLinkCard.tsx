"use client";

import { useState, useEffect } from "react";
import { isDemoManagedLink } from "@/lib/demoManagedLinks";
import type { ManagedLink } from "./types";

export interface ManagedLinkCardProps {
  link: ManagedLink;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onUpdate?: (updates: Partial<ManagedLink>) => void;
}

export function ManagedLinkCard({
  link,
  onEdit,
  onDelete,
  onToggle,
  onUpdate,
}: ManagedLinkCardProps) {
  const { title, url, clicks, draft, trendLabel } = link;
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

  return (
    <div
      className={`group relative flex overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-sm transition-all hover:shadow-md dark:border-outline-variant/30 dark:bg-surface-container-lowest ${
        draft ? "opacity-[0.92]" : ""
      }`}
    >
      {!draft && (
        <div
          className="w-1 shrink-0 self-stretch bg-primary"
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 gap-4 p-5 sm:gap-5 sm:p-6">
        <div
          className="mt-0.5 flex shrink-0 cursor-grab flex-col items-center justify-start text-on-surface-variant/35 transition-colors group-hover:text-on-surface-variant/55"
          aria-hidden
        >
          <span className="material-symbols-outlined text-[20px] select-none">drag_indicator</span>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              {isDemo && (
                <span className="mb-0.5 inline-flex rounded-md bg-primary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary-container">
                  Sample
                </span>
              )}
              {editingField === "title" ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  className="w-full border-b border-primary/40 bg-transparent text-base font-semibold tracking-tight text-on-surface outline-none dark:border-primary/50"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField("title")}
                  className="block w-full text-left"
                >
                  <h3 className="truncate text-base font-semibold tracking-tight text-on-surface">{title}</h3>
                </button>
              )}

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
                    draft
                      ? "italic text-on-surface-variant"
                      : "text-primary"
                  }`}
                >
                  {url}
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {onToggle ? (
                <button
                  type="button"
                  onClick={onToggle}
                  className="shrink-0 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
                  title={draft ? "Publish link" : "Mark as draft"}
                >
                  {draft ? (
                    <span className="inline-flex rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                      Draft
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
                  )}
                </button>
              ) : draft ? (
                <span className="inline-flex rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                  Draft
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
              )}

              <button
                type="button"
                onClick={() => (onEdit ? onEdit() : setEditingField("title"))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                title="Edit"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete?.()}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                aria-label={`Delete ${title}`}
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>

          {showStats && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">visibility</span>
                <span className="font-medium">{clicks} clicks</span>
              </span>
              {trendLabel ? (
                <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  {trendLabel}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
