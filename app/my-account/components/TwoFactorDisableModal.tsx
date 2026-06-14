"use client";

import { useState } from "react";
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

  const handleDisable = async () => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ink-900 mb-1">Disable two-factor authentication</h2>
        <p className="text-xs text-ink-400 mb-5">
          Enter your authenticator code or a recovery code to confirm.
        </p>
        <label className="block text-xs font-medium text-ink-500 mb-1.5" htmlFor="disable-2fa-code">
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
            className={`w-full rounded-xl border px-4 py-3 text-center font-mono tracking-widest text-sm mb-1 outline-none transition focus:ring-2 focus:ring-indigo-400/30 ${
              codeError ? "border-red-400" : "border-ink-100 focus:border-indigo-400"
            }`}
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
        {codeError && <p className="text-xs text-red-500 mt-2 mb-3 text-center">{codeError}</p>}
        {!codeError && <div className="mb-3" />}
        <button
          type="button"
          onClick={() => {
            setUseBackupCode((v) => !v);
            setCode("");
            setCodeError("");
          }}
          className="text-xs text-indigo-500 hover:underline cursor-pointer mb-5 block"
        >
          {useBackupCode ? "Use authenticator code instead" : "Use a recovery code instead"}
        </button>
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="rounded-xl border border-ink-100 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !code.trim()}
            onClick={handleDisable}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Disabling…" : "Disable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
