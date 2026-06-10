"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface LoginModalProps {
  onClose: () => void;
  children: ReactNode;
}

export function LoginModal({ onClose, children }: LoginModalProps) {
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${isMobile ? "items-end" : "items-center justify-center p-4"} bg-black/70 animate-modal-backdrop`}
      onClick={onClose}
    >
      <div
        className="relative w-full"
        style={{
          maxWidth:     isMobile ? undefined : 384,
          background:   "var(--color-surface, white)",
          borderRadius: isMobile ? "24px 24px 0 0" : 16,
          padding:      isMobile
            ? "0 24px calc(24px + env(safe-area-inset-bottom,0px))"
            : "2rem",
          boxShadow:    "0 20px 60px rgba(0,0,0,0.25)",
          animation:    isMobile
            ? "lhSheetIn 0.35s cubic-bezier(0.32,0.72,0,1)"
            : "animate-modal-card",
        }}
        onClick={e => e.stopPropagation()}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-4 shrink-0">
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
          </div>
        )}

        {!isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}

        {children}

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
