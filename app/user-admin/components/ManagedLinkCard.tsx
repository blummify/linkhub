"use client";

import { useState, useEffect } from "react";
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
  const { title, url, clicks, draft } = link;
  const [editingField, setEditingField] = useState<"title" | "url" | null>(null);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempUrl, setTempUrl] = useState(url);

  // Sync temporary inline-edit fields when parent link values change.
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

  return (
    <div
      className={`group relative bg-surface-container-lowest rounded-[2rem] p-4 sm:p-5 flex items-start gap-3 sm:gap-4 border border-outline-variant/30 shadow-none transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 ${
        draft ? "opacity-70 grayscale-[0.3]" : ""
      }`}
    >
      {/* Drag Indicator */}
      <div className="mt-1.5 flex items-center justify-center text-on-surface-variant/20 group-hover:text-on-surface-variant/40 transition-colors cursor-grab">
        <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none" aria-hidden>
          drag_indicator
        </span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Top Row: Title, URL and Action Switch */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 group/title w-full">
              {editingField === "title" ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  className="bg-transparent font-bold text-[15px] sm:text-[16px] text-on-surface tracking-tight outline-none border-b border-primary/30 w-full"
                />
              ) : (
                <div 
                  onClick={() => setEditingField("title")}
                  className="flex items-center gap-2 cursor-pointer w-fit max-w-full"
                >
                  <h3 className="font-bold text-[15px] sm:text-[16px] text-on-surface tracking-tight truncate">{title}</h3>
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-on-surface-variant/30 group-hover/title:text-primary transition-colors">edit</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 group/url w-full">
              {editingField === "url" ? (
                <input
                  autoFocus
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  onBlur={handleUrlSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  className="bg-transparent text-[13px] sm:text-[14px] text-on-surface-variant/70 font-medium outline-none border-b border-primary/20 w-full"
                />
              ) : (
                <div 
                  onClick={() => setEditingField("url")}
                  className="flex items-center gap-2 cursor-pointer w-fit max-w-full"
                >
                  <p className="text-[13px] sm:text-[14px] text-on-surface-variant/70 font-medium truncate">{url}</p>
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-on-surface-variant/30 group-hover/url:text-primary transition-colors">edit</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 mt-0.5">
            <button title="Share" className="text-on-surface-variant/40 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">ios_share</span>
            </button>
            <button 
              onClick={onToggle} 
              className={`relative w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-all duration-300 ${
                !draft ? 'bg-primary' : 'bg-outline-variant/40'
              }`}
            >
              <div className={`absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-all duration-300 ${
                !draft ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Tool Icons & Stats */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-3 sm:gap-4 text-on-surface-variant/40">
              <button title="Layout" className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px] sm:text-[20px]">grid_view</span></button>
              <button title="Image" className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px] sm:text-[20px]">image</span></button>
              <button title="Prioritize" className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px] sm:text-[20px]">star</span></button>
            </div>
            <div className="h-3 w-px bg-outline-variant/30" />
            <div className="flex items-center gap-1.5 text-on-surface-variant/50 group/stats cursor-pointer hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">analytics</span>
              <span className="text-[11px] sm:text-[12px] font-bold tracking-tight">{clicks} clicks</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-error/10 hover:text-error rounded-xl text-on-surface-variant/30 transition-all active:scale-90"
            aria-label={`Delete ${title}`}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
