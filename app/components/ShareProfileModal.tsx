"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setIsClosing(false); }, [open]);

  function requestClose() { setIsClosing(true); }

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isClosing) return;
    const handler = (e: AnimationEvent) => { if (e.target === panel) onClose(); };
    panel.addEventListener('animationend', handler);
    return () => panel.removeEventListener('animationend', handler);
  }, [isClosing, onClose]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [profileUrl]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${isMobile ? "items-end" : "items-center justify-center p-4"}`}
      style={{
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${isClosing ? "var(--motion-sheet-out) var(--ease-in)" : "var(--motion-base) var(--ease-standard)"}`,
      }}
      onClick={requestClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" aria-hidden />
      <div
        data-testid="modal-panel"
        className="relative w-full bg-surface shadow-2xl border border-outline-variant/40"
        style={{
          borderRadius: isMobile ? "24px 24px 0 0" : "2.5rem",
          maxWidth: isMobile ? undefined : "28rem",
          padding: isMobile
            ? `0 2.5rem calc(2rem + env(safe-area-inset-bottom,0px))`
            : "2.5rem",
          animation: isClosing
            ? `${isMobile ? "lhSheetOut" : "lhModalOut"} var(--motion-sheet-out) var(--ease-in) forwards`
            : `${isMobile ? "lhSheetIn" : "lhModalIn"} var(--motion-sheet-in) var(--ease-out) both`,
        }}
        ref={panelRef}
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
            onClick={requestClose}
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
