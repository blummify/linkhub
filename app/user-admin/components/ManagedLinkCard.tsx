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
      className={`group relative bg-surface-container-lowest rounded-3xl p-4 flex items-center gap-4 border border-outline-variant/30 shadow-none transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 ${
        draft ? "opacity-60 grayscale-[0.5]" : ""
      }`}
    >
      {/* Subtle Selection/Accent Indicator */}
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all duration-300 ${
        draft ? "bg-outline-variant/30" : "bg-primary scale-y-0 group-hover:scale-y-100"
      }`} />

      <div className="flex items-center justify-center p-2 rounded-xl bg-surface-container-low text-on-surface-variant/40 group-hover:text-primary/60 transition-colors">
        <span className="material-symbols-outlined text-[20px] select-none" aria-hidden>
          drag_indicator
        </span>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-[15px] text-on-surface tracking-tight">{title}</h3>
          {draft && (
            <span className="px-2 py-0.5 bg-surface-container-high text-[9px] font-bold text-on-surface-variant uppercase tracking-wider rounded-md">Draft</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="material-symbols-outlined text-[14px] text-primary/40">link</span>
          <p className="text-[12px] text-primary/70 font-medium truncate">{url}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-2xl bg-surface-container-low/50 group-hover:bg-primary/5 transition-colors border border-transparent group-hover:border-primary/10">
          <span className="text-[12px] font-bold text-on-surface group-hover:text-primary transition-colors">{clicks}</span>
          <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-tighter">Clicks</span>
        </div>

        <div className="flex items-center bg-surface-container-low/30 rounded-2xl p-1 gap-1 border border-outline-variant/10">
          <button
            type="button"
            onClick={onEdit}
            className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-all active:scale-90"
            aria-label={`Edit ${title}`}
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
          </button>
          <div className="w-px h-4 bg-outline-variant/30" />
          <button
            type="button"
            onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center hover:bg-error/10 hover:text-error rounded-xl text-on-surface-variant transition-all active:scale-90"
            aria-label={`Delete ${title}`}
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
