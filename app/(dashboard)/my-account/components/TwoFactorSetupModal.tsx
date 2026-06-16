"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { setup2FA, enable2FA } from "@/app/actions/twoFactor";
import { TotpCodeInput } from "@/app/components/auth/TotpCodeInput";

interface TwoFactorSetupModalProps {
  onClose: () => void;
  onEnabled: () => void;
}

type SetupStep = "qr" | "verify" | "backup";

const STEP_COPY: Record<SetupStep, { title: ReactNode; description: ReactNode }> = {
  qr: {
    title: <>Set up <em style={{ color: "#3b46e0" }}>authenticator</em></>,
    description: "Scan the QR code with Google Authenticator, 1Password, Authy, or any TOTP app.",
  },
  verify: {
    title: <>Verify your <em style={{ color: "#3b46e0" }}>code</em></>,
    description: "Enter the 6-digit code shown in your authenticator app.",
  },
  backup: {
    title: <>Save your <em style={{ color: "#3b46e0" }}>recovery codes</em></>,
    description: "Store these somewhere safe — each code only works once if you lose access to your authenticator app.",
  },
};

export function TwoFactorSetupModal({ onClose, onEnabled }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<SetupStep>("qr");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupSaved, setBackupSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

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

  useEffect(() => {
    setup2FA().then((result) => {
      setLoading(false);
      if ("error" in result) {
        toast.error(result.error);
        requestClose();
        return;
      }
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setManualKey(result.manualKey);
    });
  }, []);

  const handleVerify = async (): Promise<void> => {
    if (!totpCode.trim()) {
      setCodeError("Please enter the 6-digit code.");
      return;
    }
    setCodeError("");
    setVerifying(true);
    const result = await enable2FA(totpCode);
    setVerifying(false);
    if ("error" in result) {
      setCodeError(result.error);
      return;
    }
    setBackupCodes(result.backupCodes);
    setStep("backup");
  };

  const handleCopyAll = (): void => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Recovery codes copied");
  };

  const handleDownload = (): void => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkhub-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const { title, description } = STEP_COPY[step];
  const secondaryBtnStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: "#1a2244",
    background: "white",
    border: "1px solid #eef0f7",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    flex: 1,
    textAlign: "center" as const,
  };

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
          maxWidth: isMobile ? undefined : 480,
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
              {title}
            </h2>
            <p style={{ fontSize: 13, color: "#6b75a3", marginTop: 4 }}>{description}</p>
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

        <div className="overflow-y-auto flex-1 min-h-0 flex flex-col" style={{ padding: "22px 28px 0", gap: 18 }}>
          {step === "qr" && (
            loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="rounded-xl border border-ink-100 p-3 bg-white">
                    <Image src={qrCodeDataUrl} alt="QR code" width={200} height={200} unoptimized />
                  </div>
                </div>
                <div className="flex flex-col items-center text-center" style={{ gap: 8 }}>
                  <p style={{ fontSize: 12, color: "#6b75a3" }}>Can&apos;t scan? Enter this key manually:</p>
                  <div
                    style={{
                      background: "#f7f8fc",
                      border: "1px solid #eef0f7",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontFamily: "monospace",
                      fontSize: 12.5,
                      color: "#1a2244",
                      letterSpacing: "0.12em",
                      wordBreak: "break-all",
                    }}
                  >
                    {manualKey}
                  </div>
                </div>
              </>
            )
          )}

          {step === "verify" && (
            <div className="flex flex-col" style={{ gap: 10 }}>
              <TotpCodeInput
                value={totpCode}
                onChange={(value) => {
                  setTotpCode(value);
                  if (codeError) setCodeError("");
                }}
                error={!!codeError}
                autoFocus
                boxClassName="border-ink-100 focus:border-indigo-400 focus:ring-indigo-400/30"
                errorBoxClassName="border-red-400 focus:ring-indigo-400/30"
              />
              {codeError && <p style={{ fontSize: 12, color: "#e11d48", textAlign: "center" }}>{codeError}</p>}
            </div>
          )}

          {step === "backup" && (
            <>
              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                {backupCodes.map((code) => (
                  <div
                    key={code}
                    style={{
                      background: "#f7f8fc",
                      border: "1px solid #eef0f7",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontFamily: "monospace",
                      fontSize: 12.5,
                      color: "#1a2244",
                      textAlign: "center",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex" style={{ gap: 8 }}>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  style={secondaryBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#d6dae9"; e.currentTarget.style.background = "#f7f8fc"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#eef0f7"; e.currentTarget.style.background = "white"; }}
                >
                  Copy all
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  style={secondaryBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#d6dae9"; e.currentTarget.style.background = "#f7f8fc"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#eef0f7"; e.currentTarget.style.background = "white"; }}
                >
                  Download
                </button>
              </div>
              <label className="flex items-start cursor-pointer" style={{ gap: 10 }}>
                <input
                  type="checkbox"
                  checked={backupSaved}
                  onChange={(e) => setBackupSaved(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-200 accent-indigo-500 cursor-pointer"
                />
                <span style={{ fontSize: 12.5, color: "#6b75a3" }}>I have saved my recovery codes in a safe place.</span>
              </label>
            </>
          )}
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
          {step === "qr" && (
            <>
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
                disabled={loading}
                onClick={() => setStep("verify")}
                className="transition-all"
                style={{
                  flex: isMobile ? 2 : undefined,
                  minHeight: isMobile ? 46 : undefined,
                  padding: "10px 18px",
                  borderRadius: 99,
                  border: 0,
                  background: !loading ? "linear-gradient(180deg,#3b46e0,#2a37c0)" : "#d6dae9",
                  color: !loading ? "white" : "#a8aecb",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: !loading ? "pointer" : "not-allowed",
                  boxShadow: !loading
                    ? "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
                    : "none",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                I&apos;ve scanned it
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <button
                type="button"
                onClick={() => setStep("qr")}
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
                Back
              </button>
              <button
                type="button"
                disabled={verifying || !totpCode.trim()}
                onClick={handleVerify}
                className="inline-flex items-center justify-center gap-1.5 transition-all"
                style={{
                  flex: isMobile ? 2 : undefined,
                  minHeight: isMobile ? 46 : undefined,
                  padding: "10px 18px",
                  borderRadius: 99,
                  border: 0,
                  background: !verifying && totpCode.trim() ? "linear-gradient(180deg,#3b46e0,#2a37c0)" : "#d6dae9",
                  color: !verifying && totpCode.trim() ? "white" : "#a8aecb",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: !verifying && totpCode.trim() ? "pointer" : "not-allowed",
                  boxShadow: !verifying && totpCode.trim()
                    ? "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
                    : "none",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { if (!verifying && totpCode.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {verifying && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path strokeLinecap="round" d="M12 2a10 10 0 010 20"/>
                  </svg>
                )}
                {verifying ? "Verifying…" : "Enable 2FA"}
              </button>
            </>
          )}

          {step === "backup" && (
            <button
              type="button"
              disabled={!backupSaved}
              onClick={() => { onEnabled(); requestClose(); }}
              className="transition-all"
              style={{
                flex: isMobile ? 1 : undefined,
                minHeight: isMobile ? 46 : undefined,
                padding: "10px 18px",
                borderRadius: 99,
                border: 0,
                background: backupSaved ? "linear-gradient(180deg,#3b46e0,#2a37c0)" : "#d6dae9",
                color: backupSaved ? "white" : "#a8aecb",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: backupSaved ? "pointer" : "not-allowed",
                boxShadow: backupSaved
                  ? "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "none",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (backupSaved) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
