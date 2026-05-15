"use client";

import { useState } from "react";

export interface ClaimHandleModalProps {
  open: boolean;
  onClose: () => void;
  onClaim: (handle: string) => Promise<{ error?: string; success?: boolean }>;
}

const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,24}$/;

export function ClaimHandleModal({ open, onClose, onClaim }: ClaimHandleModalProps) {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = HANDLE_REGEX.test(handle);

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    const result = await onClaim(handle);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px] text-gray-600">close</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-indigo-500">link</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Claim your link</h2>
        <p className="text-sm text-center text-gray-500 mb-7">
          Pick a unique handle for your Linkhub URL. You can change it later.
        </p>

        {/* Input */}
        <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden mb-2 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition-all">
          <span className="px-4 py-3 text-sm font-semibold text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap select-none">
            linkhub.app/
          </span>
          <input
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="yourname"
            maxLength={24}
            autoFocus
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 bg-white outline-none disabled:opacity-50"
            aria-label="Handle"
          />
        </div>

        <p className="text-xs text-gray-400 mb-1 px-1">
          3–24 chars · letters, numbers, underscores
        </p>

        {error && (
          <p className="text-xs text-red-500 mb-3 px-1">{error}</p>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="mt-5 w-full py-4 rounded-full bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            "Continue to dashboard"
          )}
        </button>

        {/* Dismiss */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          I&apos;ll do this later
        </button>
      </div>
    </div>
  );
}
