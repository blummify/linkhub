"use client";

import { useEffect, useRef, useState } from "react";
import { disable2FA } from "@/app/actions/twoFactor";
import { TotpCodeInput } from "@/app/components/auth/TotpCodeInput";

interface TwoFactorDisableModalProps {
  onClose: () => void;
  onDisabled: () => void;
}

export function TwoFactorDisableModal({ onClose, onDisabled }: TwoFactorDisableModalProps) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );

  function requestClose(): void {
    setIsClosing(true);
  }

  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isClosing) return;
    const handler = (e: AnimationEvent) => { if (e.target === panel) onClose(); };
    panel.addEventListener("animationend", handler);
    return () => panel.removeEventListener("animationend", handler);
  }, [isClosing, onClose]);

  useEffect(() => {
    function handler(e: KeyboardEvent): void {
      if (e.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleDisable = async (): Promise<void> => {
    if (!code.trim()) {
      setCodeError("Please enter a code.");
      return;
    }
    setCodeError("");
    setLoading(true);
    const result = await disable2FA(code);
    setLoading(false);
    if ("error" in result) {
      setCodeError(result.error);
      return;
    }
    onDisabled();
    requestClose();
  };

  const canDisable = !loading && !!code.trim();

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${isMobile ? "items-end" : "items-center justify-center p-6"}`}
      style={{
        background: "rgba(11,16,32,0.55)",
        backdropFilter: "blur(8px)",
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${isClosing ? "var(--motion-sheet-out) var(--ease-in)" : "var(--motion-base) var(--ease-standard)"}`,
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        requestClose();
      }}
    >
      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: isMobile ? undefined : 420,
          maxHeight: isMobile ? "min(90dvh, 90vh)" : "calc(100vh - 48px)",
          background: "white",
          borderRadius: isMobile ? "24px 24px 0 0" : 22,
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: isClosing
            ? `${isMobile ? "lhSheetOut" : "lhModalOut"} var(--motion-sheet-out) var(--ease-in) forwards`
            : `${isMobile ? "lhSheetIn" : "lhModalIn"} var(--motion-sheet-in) var(--ease-out) both`,
        }}
        ref={panelRef}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
          </div>
        )}

        <div className="flex items-start justify-between gap-4" style={{ padding: "24px 28px 0" }}>
          <div className="flex-1">
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontStyle: "italic",
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: "#0b1020",
                lineHeight: 1.1,
              }}
            >
              Disable <em style={{ color: "#3b46e0" }}>two-factor auth</em>
            </h2>
            <p style={{ fontSize: 13, color: "#6b75a3", marginTop: 4 }}>
              Enter your authenticator code or a recovery code to confirm.
            </p>
          </div>

          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="flex items-center justify-center transition-all shrink-0"
            style={{ width: 34, height: 34, borderRadius: "50%", border: 0, background: "#eef0f7", color: "#3a4474", cursor: "pointer" }}
            onMouseEnter={e => {
              const b = e.currentTarget;
              b.style.background = "#d6dae9";
              b.style.color = "#0b1020";
              b.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget;
              b.style.background = "#eef0f7";
              b.style.color = "#3a4474";
              b.style.transform = "rotate(0deg)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 flex flex-col" style={{ padding: "22px 28px 0", gap: 14 }}>
          <div className="flex flex-col" style={{ gap: 7 }}>
            <label
              htmlFor="disable-2fa-code"
              className="uppercase"
              style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em" }}
            >
              {useBackupCode ? "Recovery code" : "Authenticator code"}
            </label>

            {useBackupCode ? (
              <input
                id="disable-2fa-code"
                type="text"
                inputMode="text"
                placeholder="XXXXX-XXXXX"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (codeError) setCodeError("");
                }}
                className="w-full outline-none transition-all"
                style={{
                  background: codeError ? "#fef2f4" : "#f7f8fc",
                  border: `1.5px solid ${codeError ? "#e11d48" : "#eef0f7"}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontFamily: "monospace",
                  fontSize: 14,
                  letterSpacing: "0.12em",
                  textAlign: "center",
                  color: "#0b1020",
                }}
                onFocus={e => {
                  if (!codeError) {
                    e.currentTarget.style.borderColor = "#6873ff";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
                  }
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = codeError ? "#e11d48" : "#eef0f7";
                  e.currentTarget.style.background = codeError ? "#fef2f4" : "#f7f8fc";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            ) : (
              <TotpCodeInput
                id="disable-2fa-code"
                value={code}
                onChange={(value) => {
                  setCode(value);
                  if (codeError) setCodeError("");
                }}
                error={!!codeError}
                autoFocus
                boxClassName="border-ink-100 focus:border-indigo-400 focus:ring-indigo-400/30"
                errorBoxClassName="border-red-400 focus:ring-indigo-400/30"
              />
            )}

            {codeError && <p style={{ fontSize: 12, color: "#e11d48", textAlign: "center" }}>{codeError}</p>}
          </div>

          <button
            type="button"
            onClick={() => {
              setUseBackupCode((v) => !v);
              setCode("");
              setCodeError("");
            }}
            className="text-left cursor-pointer self-start"
            style={{ fontSize: 12.5, color: "#3b46e0", fontWeight: 500 }}
          >
            {useBackupCode ? "Use authenticator code instead" : "Use a recovery code instead"}
          </button>
        </div>

        <div
          className="flex items-center justify-end shrink-0"
          style={{
            gap: 8,
            padding: isMobile
              ? "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))"
              : "20px 28px 22px",
            marginTop: isMobile ? 0 : 22,
            borderTop: "1px solid #eef0f7",
            background: "linear-gradient(180deg, transparent, rgba(241,243,255,0.4))",
          }}
        >
          <button
            type="button"
            onClick={requestClose}
            className="transition-all"
            style={{
              flex: isMobile ? 1 : undefined,
              minHeight: isMobile ? 46 : undefined,
              padding: "10px 18px",
              borderRadius: 99,
              border: isMobile ? "1.5px solid #d6dae9" : 0,
              background: "transparent",
              color: "#3a4474",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#eef0f7"; e.currentTarget.style.color = "#0b1020"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3a4474"; }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canDisable}
            onClick={handleDisable}
            className="inline-flex items-center justify-center gap-1.5 transition-all"
            style={{
              flex: isMobile ? 2 : undefined,
              minHeight: isMobile ? 46 : undefined,
              padding: "10px 18px",
              borderRadius: 99,
              border: 0,
              background: canDisable ? "linear-gradient(180deg,#f43f5e,#e11d48)" : "#d6dae9",
              color: canDisable ? "white" : "#a8aecb",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: canDisable ? "pointer" : "not-allowed",
              boxShadow: canDisable
                ? "0 6px 18px -6px rgba(225,29,72,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
                : "none",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { if (canDisable) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {loading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                <path strokeLinecap="round" d="M12 2a10 10 0 010 20"/>
              </svg>
            )}
            {loading ? "Disabling…" : "Disable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
