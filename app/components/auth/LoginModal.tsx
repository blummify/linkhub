"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";

interface LoginModalProps {
  onClose: () => void;
  children: ReactNode;
}

export function LoginModal({ onClose, children }: LoginModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
