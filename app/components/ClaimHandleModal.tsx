"use client";

import { useState, useRef, useEffect } from "react";
import FocusTrap from "focus-trap-react";
import { APP_DOMAIN } from "@/lib/appConfig";

export interface ClaimHandleModalProps {
  open: boolean;
  onClose: () => void;
  onClaim: (handle: string) => Promise<{ error?: string; success?: boolean }>;
  onCheckAvailability?: (handle: string) => Promise<{ available: boolean }>;
  /** Pre-fills the input when the user already has a handle and reopens the modal. */
  currentHandle?: string;
  /** Label for the primary action button. Defaults to "Continue to dashboard". */
  submitLabel?: string;
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

/** Generate up to 4 alternative handle suggestions when the desired one is taken. */
function generateSuggestions(h: string): string[] {
  const mid = Math.floor(h.length / 2);
  const candidates = [
    `${h}1`,
    `${h.slice(0, mid)}_${h.slice(mid)}`,
    `${h}_`,
    `${h}2`,
  ];
  return candidates.filter((s) => s !== h && validateFormat(s).ok).slice(0, 4);
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

interface ModalState {
  handle: string;
  inputState: InputState;
  helperMsg: string;
  helperKind: HelperKind;
  continueEnabled: boolean;
  isSubmitting: boolean;
  suggestions: string[];
}

const INITIAL_STATE: ModalState = {
  handle: "",
  inputState: "neutral",
  helperMsg: "3–24 characters · letters, numbers and underscores",
  helperKind: "default",
  continueEnabled: false,
  isSubmitting: false,
  suggestions: [],
};

export function ClaimHandleModal({
  open,
  onClose,
  onClaim,
  onCheckAvailability,
  currentHandle,
  submitLabel = "Continue to dashboard",
}: ClaimHandleModalProps) {
  const [state, setState] = useState<ModalState>(INITIAL_STATE);
  const { handle, inputState, helperMsg, helperKind, continueEnabled, isSubmitting, suggestions } = state;
  const [isFocused, setIsFocused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkIdRef = useRef(0);
  const seenRef = useRef<Map<string, boolean>>(new Map());
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset on close / pre-fill on open — done during render (not in an effect) per the
  // React "storing information from previous renders" pattern. This avoids the
  // react-hooks/set-state-in-effect lint error while keeping correct behaviour.
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setState(INITIAL_STATE);
      setIsClosing(false);
    } else if (currentHandle) {
      setState({
        handle: currentHandle,
        inputState: "valid",
        helperMsg: "This is your current handle",
        helperKind: "valid",
        continueEnabled: true,
        isSubmitting: false,
        suggestions: [],
      });
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function processInput(value: string, delayMs = 400): void {
    if (timerRef.current) clearTimeout(timerRef.current);
    checkIdRef.current++;

    if (value.length === 0) {
      setState((prev) => ({
        ...prev,
        handle: value,
        inputState: "neutral",
        helperMsg: "3–24 characters · letters, numbers and underscores",
        helperKind: "default",
        continueEnabled: false,
        suggestions: [],
      }));
      return;
    }

    const fmt = validateFormat(value);
    if (!fmt.ok) {
      setState((prev) => ({
        ...prev,
        handle: value,
        inputState: "invalid",
        helperMsg: fmt.reason!,
        helperKind: "invalid",
        continueEnabled: false,
        suggestions: [],
      }));
      return;
    }

    if (!onCheckAvailability) {
      setState((prev) => ({
        ...prev,
        handle: value,
        inputState: "valid",
        helperMsg: `"${value}" looks good`,
        helperKind: "valid",
        continueEnabled: true,
        suggestions: [],
      }));
      return;
    }

    // Client-side cache hit — skip spinner and server round-trip entirely
    const cached = seenRef.current.get(value);
    if (cached !== undefined) {
      setState((prev) => ({
        ...prev,
        handle: value,
        inputState: cached ? "valid" : "invalid",
        helperMsg: cached
          ? `Great pick — "${value}" is available`
          : `"${value}" is already taken — try another`,
        helperKind: cached ? "valid" : "invalid",
        continueEnabled: cached,
        suggestions: cached ? [] : generateSuggestions(value),
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      handle: value,
      inputState: "checking",
      helperMsg: "Checking availability…",
      helperKind: "default",
      continueEnabled: false,
      suggestions: [],
    }));

    const myId = checkIdRef.current;
    timerRef.current = setTimeout(async () => {
      const result = await onCheckAvailability(value);
      if (myId !== checkIdRef.current) return;
      seenRef.current.set(value, result.available);
      if (result.available) {
        setState((prev) => ({
          ...prev,
          inputState: "valid",
          helperMsg: `Great pick — "${value}" is available`,
          helperKind: "valid",
          continueEnabled: true,
          suggestions: [],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          inputState: "invalid",
          helperMsg: `"${value}" is already taken — try another`,
          helperKind: "invalid",
          continueEnabled: false,
          suggestions: generateSuggestions(value),
        }));
      }
    }, delayMs);
  }

  /** Clicking a suggestion auto-fills the input and triggers an immediate availability check. */
  const handleSuggestionClick = (s: string): void => {
    processInput(s, 0);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!continueEnabled || isSubmitting) return;
    setState((prev) => ({ ...prev, isSubmitting: true }));
    const result = await onClaim(handle);
    if (result.error) {
      setState((prev) => ({
        ...prev,
        inputState: "invalid",
        helperMsg: result.error!,
        helperKind: "invalid",
        continueEnabled: false,
        isSubmitting: false,
      }));
    }
  };

  const handleClose = (): void => {
    if (isSubmitting) return;
    setIsClosing(true);
  };

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isClosing) return;
    const handler = (e: AnimationEvent) => { if (e.target === panel) onClose(); };
    panel.addEventListener('animationend', handler);
    return () => panel.removeEventListener('animationend', handler);
  }, [isClosing, onClose]);

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
        .lh-close-btn:hover { transform: rotate(90deg); }
        .lh-primary-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px -6px rgba(59, 70, 224, 0.55) !important;
        }
        .lh-suggestion-chip:hover { border-color: #3b46e0; color: #3b46e0; background: #f1f3ff; }
      `}</style>

      <FocusTrap active={!isClosing} focusTrapOptions={{ allowOutsideClick: true, returnFocusOnDeactivate: true }}>
      <div className={`fixed inset-0 z-[100] flex ${isMobile ? "items-end" : "items-center justify-center p-6"}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(11, 16, 32, 0.6)",
            backdropFilter: "blur(8px)",
            opacity: isClosing ? 0 : 1,
            transition: `opacity ${isClosing ? "var(--motion-sheet-out) var(--ease-in)" : "var(--motion-base) var(--ease-standard)"}`,
          }}
          onClick={() => { if (!isMobile || handle.length === 0) handleClose(); }}
          aria-hidden
        />

        {/* Modal */}
        <div
          data-testid="modal-panel"
          className="relative w-full bg-white"
          style={{
            maxWidth: isMobile ? undefined : 460,
            maxHeight: isMobile ? "min(90dvh, 90vh)" : undefined,
            overflow: isMobile ? "auto" : "hidden",
            borderRadius: isMobile ? "24px 24px 0 0" : 22,
            boxShadow:
              "0 40px 80px -20px rgba(15, 23, 42, 0.25), 0 16px 32px -16px rgba(15, 23, 42, 0.12)",
            animation: isClosing
              ? `${isMobile ? "lhSheetOut" : "lhModalOut"} var(--motion-sheet-out) var(--ease-in) forwards`
              : `${isMobile ? "lhSheetIn" : "lhModalIn"} var(--motion-sheet-in) var(--ease-out) both`,
          }}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="claimTitle"
        >
          {isMobile && (
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
            </div>
          )}

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
                  {APP_DOMAIN}/
                </span>
                <input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    processInput(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="e.g. alexsmith"
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

              {/* Handle suggestions — shown when the entered handle is already taken */}
              {suggestions.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p
                    style={{
                      fontSize: 11.5,
                      color: "#6b75a3",
                      marginBottom: 7,
                      fontWeight: 500,
                    }}
                  >
                    Try one of these instead:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        disabled={isSubmitting}
                        className="lh-suggestion-chip transition-all duration-150 cursor-pointer disabled:opacity-40"
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 12.5,
                          fontWeight: 500,
                          padding: "5px 12px",
                          borderRadius: 99,
                          border: "1.5px solid #d6dae9",
                          background: "#f7f8fc",
                          color: "#3a4474",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            className="flex flex-col"
            style={{
              padding: isMobile
                ? `16px 28px calc(24px + env(safe-area-inset-bottom,0px))`
                : "24px 32px 28px",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!continueEnabled || isSubmitting}
              className="lh-primary-btn w-full flex items-center justify-center transition-all duration-150 disabled:cursor-not-allowed"
              style={{
                minHeight: isMobile ? 46 : undefined,
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
                  {submitLabel}
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
                minHeight: isMobile ? 46 : undefined,
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
      </FocusTrap>
    </>
  );
}
