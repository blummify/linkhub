"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { setup2FA, enable2FA } from "@/app/actions/twoFactor";
import { TotpCodeInput } from "@/app/components/auth/TotpCodeInput";

interface TwoFactorSetupModalProps {
  onClose: () => void;
  onEnabled: () => void;
}

type SetupStep = "qr" | "verify" | "backup";

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

  useEffect(() => {
    setup2FA().then((result) => {
      setLoading(false);
      if ("error" in result) {
        toast.error(result.error);
        onClose();
        return;
      }
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setManualKey(result.manualKey);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
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

  const handleCopyAll = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Recovery codes copied");
  };

  const handleDownload = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkhub-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "qr" && (
          <>
            <h2 className="text-base font-semibold text-ink-900 mb-1">Set up authenticator app</h2>
            <p className="text-xs text-ink-400 mb-5">
              Scan the QR code with Google Authenticator, 1Password, Authy, or any TOTP app.
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-xl border border-ink-100 p-3 bg-white">
                    <Image src={qrCodeDataUrl} alt="QR code" width={200} height={200} unoptimized />
                  </div>
                </div>
                <p className="text-xs text-ink-400 text-center mb-1">Can&apos;t scan? Enter this key manually:</p>
                <div className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-2 text-xs font-mono text-ink-700 text-center tracking-widest break-all mb-5">
                  {manualKey}
                </div>
              </>
            )}
            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={onClose} className="rounded-xl border border-ink-100 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep("verify")}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                I&apos;ve scanned it
              </button>
            </div>
          </>
        )}

        {step === "verify" && (
          <>
            <h2 className="text-base font-semibold text-ink-900 mb-1">Verify your code</h2>
            <p className="text-xs text-ink-400 mb-5">Enter the 6-digit code shown in your authenticator app.</p>
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
            {codeError && <p className="text-xs text-red-500 mt-2 mb-2 text-center">{codeError}</p>}
            {!codeError && <div className="mb-4" />}
            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={() => setStep("qr")} className="rounded-xl border border-ink-100 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors cursor-pointer">
                Back
              </button>
              <button
                type="button"
                disabled={verifying || !totpCode.trim()}
                onClick={handleVerify}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {verifying ? "Verifying…" : "Enable 2FA"}
              </button>
            </div>
          </>
        )}

        {step === "backup" && (
          <>
            <h2 className="text-base font-semibold text-ink-900 mb-1">Save your recovery codes</h2>
            <p className="text-xs text-ink-400 mb-4">
              Store these somewhere safe. Each code can only be used once if you lose access to your authenticator app.
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {backupCodes.map((code) => (
                <div key={code} className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-1.5 text-xs font-mono text-ink-700 text-center tracking-widest">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-5">
              <button type="button" onClick={handleCopyAll} className="flex-1 rounded-xl border border-ink-100 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors cursor-pointer">
                Copy all
              </button>
              <button type="button" onClick={handleDownload} className="flex-1 rounded-xl border border-ink-100 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors cursor-pointer">
                Download
              </button>
            </div>
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={backupSaved}
                onChange={(e) => setBackupSaved(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-ink-200 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-ink-500">I have saved my recovery codes in a safe place.</span>
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!backupSaved}
                onClick={() => { onEnabled(); onClose(); }}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
