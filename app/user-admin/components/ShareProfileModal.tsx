"use client";

import { useState, useCallback } from "react";

export interface ShareProfileModalProps {
  open: boolean;
  onClose: () => void;
  /** Full public URL or path to copy (e.g. linktr.ee/handle) */
  profileUrl: string;
  title?: string;
}

export function ShareProfileModal({
  open,
  onClose,
  profileUrl,
  title = "Share Profile",
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [profileUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-surface rounded-[2.5rem] p-10 shadow-2xl border border-outline-variant/40 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="bg-surface-container-low p-4 rounded-3xl flex items-center justify-between gap-3 min-w-0">
          <span className="text-sm font-bold opacity-60 truncate">{profileUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 px-8 py-2 bg-on-surface text-surface rounded-full text-[11px] font-black"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
