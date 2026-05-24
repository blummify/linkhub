"use client";

import { useState, useRef, useEffect } from "react";

export interface ClaimHandleModalProps {
  open: boolean;
  onClose: () => void;
  onClaim: (handle: string) => Promise<{ error?: string; success?: boolean }>;
  onCheckAvailability?: (handle: string) => Promise<{ available: boolean }>;
}

type InputState = "neutral" | "checking" | "valid" | "invalid";
type HelperKind = "default" | "valid" | "invalid";

function validateFormat(h: string): { ok: boolean; reason?: string } {
  if (h.length === 0) return { ok: false, reason: "empty" };
  if (h.length < 3) return { ok: false, reason: "Handle must be at least 3 characters" };
  if (h.length > 24) return { ok: false, reason: "Handle must be 24 characters or fewer" };
  if (!/^[a-zA-Z0-9_]+$/.test(h)) return { ok: false, reason: "Only letters, numbers and underscores" };
  if (/^[0-9_]/.test(h)) return { ok: false, reason: "Must start with a letter" };
  return { ok: true };
}

const SpinnerSvg = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite" }}
  >
    <path
      strokeLinecap="round"
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      opacity="0.4"
    />
    <path strokeLinecap="round" d="M12 2v4" />
  </svg>
);

const CheckSvg = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: size, height: size, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XSvg = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: size, height: size, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const InfoSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
  </svg>
);

const WarnSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
  </svg>
);

export function ClaimHandleModal({
  open,
  onClose,
  onClaim,
  onCheckAvailability,
}: ClaimHandleModalProps) {
  const [handle, setHandle] = useState("");
  const [inputState, setInputState] = useState<InputState>("neutral");
  const [isFocused, setIsFocused] = useState(false);
  const [helperMsg, setHelperMsg] = useState(
    "3–24 characters · letters, numbers and underscores"
  );
  const [helperKind, setHelperKind] = useState<HelperKind>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [continueEnabled, setContinueEnabled] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function processInput(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    checkIdRef.current++;
    setContinueEnabled(false);

    if (value.length === 0) {
      setInputState("neutral");
      setHelperMsg("3–24 characters · letters, numbers and underscores");
      setHelperKind("default");
      return;
    }

    const fmt = validateFormat(value);
    if (!fmt.ok) {
      setInputState("invalid");
      setHelperMsg(fmt.reason!);
      setHelperKind("invalid");
      return;
    }

    if (!onCheckAvailability) {
      setInputState("valid");
      setHelperMsg(`"${value}" looks good`);
      setHelperKind("valid");
      setContinueEnabled(true);
      return;
    }

    setInputState("checking");
    setHelperMsg("Checking availability…");
    setHelperKind("default");
    const myId = checkIdRef.current;
    timerRef.current = setTimeout(async () => {
      const result = await onCheckAvailability(value);
      if (myId !== checkIdRef.current) return;
      if (result.available) {
        setInputState("valid");
        setHelperMsg(`Great pick — "${value}" is available`);
        setHelperKind("valid");
        setContinueEnabled(true);
      } else {
        setInputState("invalid");
        setHelperMsg(`"${value}" is already taken — try another`);
        setHelperKind("invalid");
      }
    }, 600);
  }

  const handleSubmit = async () => {
    if (!continueEnabled || isSubmitting) return;
    setIsSubmitting(true);
    const result = await onClaim(handle);
    if (result.error) {
      setInputState("invalid");
      setHelperMsg(result.error);
      setHelperKind("invalid");
      setContinueEnabled(false);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!open) return null;

  const borderColor =
    inputState === "valid"
      ? "#16a34a"
      : inputState === "invalid"
        ? "#e11d48"
        : isFocused
          ? "#6873ff"
          : "#d6dae9";

  const ringColor =
    inputState === "valid"
      ? "rgba(22, 163, 74, 0.1)"
      : inputState === "invalid"
        ? "rgba(225, 29, 72, 0.08)"
        : isFocused
          ? "rgba(104, 115, 255, 0.12)"
          : undefined;

  const helperColor =
    helperKind === "valid"
      ? "#16a34a"
      : helperKind === "invalid"
        ? "#e11d48"
        : "#6b75a3";

  return (
    <>
      <style>{`
        @keyframes lhModalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .lh-modal-in {
          animation: lhModalIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lh-close-btn:hover {
          transform: rotate(90deg);
        }
        .lh-primary-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px -6px rgba(59, 70, 224, 0.55) !important;
        }
      `}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(11, 16, 32, 0.6)", backdropFilter: "blur(8px)" }}
          onClick={handleClose}
          aria-hidden
        />

        {/* Modal */}
        <div
          className="lh-modal-in relative w-full overflow-hidden bg-white"
          style={{
            maxWidth: 460,
            borderRadius: 22,
            boxShadow:
              "0 40px 80px -20px rgba(15, 23, 42, 0.25), 0 16px 32px -16px rgba(15, 23, 42, 0.12)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="claimTitle"
        >
          {/* Tinted top band */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: 80,
              background: "linear-gradient(180deg, #f1f3ff 0%, white 100%)",
            }}
          />

          {/* ── Header ── */}
          <div className="relative flex items-start justify-between gap-4" style={{ padding: "30px 32px 0" }}>
            <div>
              <h1
                id="claimTitle"
                style={{
                  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontSize: 32,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "#0b1020",
                  margin: 0,
                }}
              >
                Claim your{" "}
                <em style={{ color: "#3b46e0", fontStyle: "italic" }}>handle</em>.
              </h1>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#3a4474",
                  lineHeight: 1.5,
                  marginTop: 8,
                }}
              >
                This becomes your public Linkhub URL. You can change it later — but you probably won&apos;t.
              </p>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="lh-close-btn flex-shrink-0 grid place-items-center transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid #eef0f7",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(4px)",
                color: "#3a4474",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ width: 14, height: 14 }}
              >
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="relative" style={{ padding: "24px 32px 0" }}>
            <div className="flex flex-col" style={{ gap: 7 }}>
              <label
                htmlFor="handle"
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#3a4474",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Your handle
              </label>

              {/* Input shell */}
              <div
                className="flex items-stretch bg-white overflow-hidden transition-all duration-150"
                style={{
                  borderRadius: 12,
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: ringColor ? `0 0 0 4px ${ringColor}` : "none",
                }}
              >
                <span
                  className="flex items-center select-none whitespace-nowrap"
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 13.5,
                    color: "#3a4474",
                    background: "#f7f8fc",
                    borderRight: "1px solid #eef0f7",
                    padding: "13px 14px",
                  }}
                >
                  linkhub.co/
                </span>
                <input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                    processInput(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="yourhandle"
                  maxLength={24}
                  autoFocus
                  disabled={isSubmitting}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="Handle"
                  aria-describedby="helperText"
                  className="flex-1 min-w-0 bg-white outline-none disabled:opacity-50"
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#0b1020",
                    padding: "13px 44px 13px 14px",
                  }}
                />
                {/* Suffix icon */}
                <div className="relative" style={{ width: 0 }}>
                  <div
                    className="absolute grid place-items-center pointer-events-none transition-opacity duration-150"
                    style={{
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 22,
                      height: 22,
                      opacity: inputState !== "neutral" ? 1 : 0,
                    }}
                  >
                    {inputState === "checking" && (
                      <span style={{ color: "#6b75a3" }}>
                        <SpinnerSvg />
                      </span>
                    )}
                    {inputState === "valid" && (
                      <span style={{ color: "#16a34a" }}>
                        <CheckSvg size={18} />
                      </span>
                    )}
                    {inputState === "invalid" && (
                      <span style={{ color: "#e11d48" }}>
                        <XSvg size={18} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Helper text */}
              <div
                id="helperText"
                className="flex items-center transition-colors duration-150"
                style={{
                  fontSize: 12,
                  color: helperColor,
                  gap: 6,
                  minHeight: 18,
                  marginTop: 8,
                }}
              >
                {helperKind === "valid" ? (
                  <CheckSvg size={12} />
                ) : helperKind === "invalid" ? (
                  <WarnSvg />
                ) : (
                  <InfoSvg />
                )}
                <span>{helperMsg}</span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex flex-col" style={{ padding: "24px 32px 28px", gap: 10 }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!continueEnabled || isSubmitting}
              className="lh-primary-btn w-full flex items-center justify-center transition-all duration-150 disabled:cursor-not-allowed"
              style={{
                padding: "13px 18px",
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                border: 0,
                background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
                boxShadow:
                  continueEnabled && !isSubmitting
                    ? "0 4px 14px -4px rgba(59, 70, 224, 0.5)"
                    : "none",
                opacity: !continueEnabled || isSubmitting ? 0.5 : 1,
                gap: 6,
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      animation: "spin 0.8s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                  Saving…
                </>
              ) : (
                <>
                  Continue to dashboard
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ width: 14, height: 14, flexShrink: 0 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M13 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full transition-colors duration-150 disabled:opacity-50"
              style={{
                padding: "13px 18px",
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                color: "#3a4474",
                border: 0,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#0b1020";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#3a4474";
              }}
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
