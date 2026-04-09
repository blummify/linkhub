"use client";

import type { ManagedLink } from "./types";

export interface ManagedLinkCardProps {
  link: ManagedLink;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ManagedLinkCard({ link, onEdit, onDelete }: ManagedLinkCardProps) {
  const { title, url, clicks, draft } = link;

  return (
    <div
      className={`bg-surface-container-lowest rounded-[2rem] p-5 flex items-center gap-5 border border-outline-variant/40 shadow-sm transition-all hover:border-secondary/20 border-l-[6px] ${
        draft ? "border-l-outline-variant/50 border-dashed opacity-70" : "border-l-secondary"
      }`}
    >
      <span className="material-symbols-outlined text-on-surface-variant/30 select-none" aria-hidden>
        drag_indicator
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-bold text-[14px] text-on-surface">{title}</h3>
          {draft && (
            <span className="px-2 py-0.5 bg-surface-container-high text-[8px] font-black uppercase rounded-full">Draft</span>
          )}
        </div>
        <p className="text-[11px] text-primary font-bold truncate">{url}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">{clicks} CLICKS</span>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-all"
          aria-label={`Edit ${title}`}
        >
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 hover:bg-error/10 hover:text-error rounded-full text-on-surface-variant transition-all"
          aria-label={`Delete ${title}`}
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
