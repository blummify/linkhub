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
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [profileUrl]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${isMobile ? "items-end" : "items-center justify-center p-4"}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" aria-hidden />
      <div
        className="relative w-full bg-surface shadow-2xl border border-outline-variant/40"
        style={{
          borderRadius: isMobile ? "24px 24px 0 0" : "2.5rem",
          maxWidth: isMobile ? undefined : "28rem",
          padding: isMobile
            ? `0 2.5rem calc(2rem + env(safe-area-inset-bottom,0px))`
            : "2.5rem",
          animation: isMobile
            ? "lhSheetIn 0.35s cubic-bezier(0.32,0.72,0,1)"
            : "zoom-in-95 0.3s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-4">
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
            style={{ minHeight: isMobile ? 46 : undefined, minWidth: isMobile ? 46 : undefined }}
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
            style={{ minHeight: isMobile ? 46 : undefined }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
