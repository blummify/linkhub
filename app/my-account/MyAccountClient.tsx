"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { CommandPalette } from "../components/CommandPalette";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { updateBranding } from "@/app/actions/profile";
import { useSidebarStore } from "@/store/sidebarStore";

/* ───────────────── Shared field styling (mirrors branding/ProfileSection) ───────────────── */
const baseInput: CSSProperties = {
  width: "100%",
  background: "#f7f8fc",
  border: "1px solid #eef0f7",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  color: "#0b1020",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
};
const fieldLabel: CSSProperties = { fontSize: 12, fontWeight: 500, color: "#3a4474" };
const fieldHint: CSSProperties = { fontSize: 11.5, color: "#6b75a3", marginTop: 2 };

function focusInput(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#6873ff";
  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
  e.currentTarget.style.background = "#fff";
}
function blurInput(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#eef0f7";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.background = "#f7f8fc";
}

/* ───────────────── Section card primitives ───────────────── */
function Section({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <section
      style={{
        background: danger ? "#fdebef" : "#fff",
        border: `1px solid ${danger ? "rgba(225,29,72,0.18)" : "#eef0f7"}`,
        borderRadius: 16,
        marginBottom: danger ? 0 : 16,
        marginTop: danger ? 24 : 0,
        overflow: "hidden",
      }}
    >
      {children}
    </section>
  );
}

function SectionHead({
  title,
  desc,
  danger,
  actions,
}: {
  title: string;
  desc: string;
  danger?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "20px 24px 4px",
        display: actions ? "flex" : "block",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: danger ? "#e11d48" : "#0b1020",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: danger ? "rgba(225,29,72,0.7)" : "#6b75a3",
            marginTop: 4,
            lineHeight: 1.45,
          }}
        >
          {desc}
        </div>
      </div>
      {actions}
    </div>
  );
}

const sectionFoot: CSSProperties = {
  padding: "14px 24px",
  borderTop: "1px solid #eef0f7",
  background: "#f7f8fc",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  alignItems: "center",
};

/* ───────────────── Button ───────────────── */
type BtnVariant = "primary" | "ghost" | "secondary" | "dangerGhost";

function Btn({
  variant,
  children,
  onClick,
  disabled,
  type = "button",
}: {
  variant: BtnVariant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const [hover, setHover] = useState(false);
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: 0,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    padding: "9px 16px",
    borderRadius: 12,
    letterSpacing: "-0.005em",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.15s, color 0.15s, transform 0.15s, border-color 0.15s, box-shadow 0.15s",
  };
  const variants: Record<BtnVariant, CSSProperties> = {
    primary: {
      background: hover && !disabled ? "#2a37c0" : "#3b46e0",
      color: "#fff",
      boxShadow: disabled ? "none" : "0 4px 12px -4px rgba(59,70,224,0.4)",
      transform: hover && !disabled ? "translateY(-1px)" : "none",
      opacity: disabled ? 0.5 : 1,
    },
    ghost: {
      background: hover ? "#f7f8fc" : "transparent",
      color: hover ? "#0b1020" : "#1a2244",
      border: `1px solid ${hover ? "#d6dae9" : "#eef0f7"}`,
      opacity: disabled ? 0.5 : 1,
    },
    secondary: {
      background: hover ? "#d6dae9" : "#eef0f7",
      color: hover ? "#0b1020" : "#1a2244",
    },
    dangerGhost: {
      background: hover ? "#fdebef" : "transparent",
      color: "#e11d48",
      border: `1px solid rgba(225,29,72,${hover ? 0.4 : 0.2})`,
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}

/* ───────────────── Password strength (ported from the design) ───────────────── */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}
const STRENGTH_LABEL: Record<number, string> = { 0: "—", 1: "Weak", 2: "Fair", 3: "Good", 4: "Strong" };
function strengthColors(score: number): { bar: string; label: string } {
  if (score >= 4) return { bar: "#16a34a", label: "#16a34a" };
  if (score === 3) return { bar: "#84cc16", label: "#65a30d" };
  if (score === 2) return { bar: "#d97706", label: "#d97706" };
  if (score === 1) return { bar: "#e11d48", label: "#e11d48" };
  return { bar: "#eef0f7", label: "#6b75a3" };
}

function StrengthMeter({ score }: { score: number }) {
  const { bar, label } = strengthColors(score);
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 4,
              borderRadius: 2,
              background: i < score ? bar : "#eef0f7",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: "#6b75a3", display: "flex", justifyContent: "space-between" }}>
        <span>Password strength</span>
        <span style={{ color: score > 0 ? label : "#6b75a3" }}>{STRENGTH_LABEL[score]}</span>
      </div>
    </div>
  );
}

/* ───────────────── Password field with per-field show/hide ───────────────── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function PassField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  children?: ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...baseInput, paddingRight: 38 }}
          onFocus={focusInput}
          onBlur={blurInput}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: 0,
            color: "#6b75a3",
            padding: 4,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1a2244")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b75a3")}
        >
          <EyeIcon />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ───────────────── Security row (2FA factor, demo state) ───────────────── */
type SecFactor = { title: string; recommended?: boolean; offDesc: string; onDesc: string; icon: ReactNode };

function Badge({ kind, children }: { kind: "on" | "off" | "recommended"; children: ReactNode }) {
  const styles: Record<typeof kind, CSSProperties> = {
    on: { background: "#e8f6ee", color: "#16a34a" },
    off: { background: "#eef0f7", color: "#3a4474" },
    recommended: { background: "#f1f3ff", color: "#2a37c0" },
  };
  const dotColor = kind === "on" ? "#16a34a" : "#6b75a3";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        padding: "2px 7px",
        borderRadius: 99,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        ...styles[kind],
      }}
    >
      {kind !== "recommended" && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />
      )}
      {children}
    </span>
  );
}

function SecRow({ factor }: { factor: SecFactor }) {
  const [enabled, setEnabled] = useState(false);
  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      toast.success(next ? "Second factor enabled" : "Second factor removed");
      return next;
    });
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        border: "1px solid #eef0f7",
        borderRadius: 12,
        background: "#f7f8fc",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "#fff",
          border: "1px solid #eef0f7",
          display: "grid",
          placeItems: "center",
          color: "#3a4474",
          flexShrink: 0,
        }}
      >
        {factor.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#0b1020",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
            flexWrap: "wrap",
          }}
        >
          {factor.title}
          {factor.recommended && <Badge kind="recommended">Recommended</Badge>}
          <Badge kind={enabled ? "on" : "off"}>{enabled ? "Active" : "Not set up"}</Badge>
        </div>
        <div style={{ fontSize: 12, color: "#6b75a3", lineHeight: 1.45 }}>
          {enabled ? factor.onDesc : factor.offDesc}
        </div>
      </div>
      <Btn variant={enabled ? "secondary" : "ghost"} onClick={toggle}>
        {enabled ? "Manage" : "Set up"}
      </Btn>
    </div>
  );
}

const SECURITY_FACTORS: SecFactor[] = [
  {
    title: "Authenticator app",
    recommended: true,
    offDesc: "Use Google Authenticator, 1Password, or Authy to generate one-time codes.",
    onDesc:
      "Connected to your authenticator app. Recovery codes are stored — view them in your downloaded backup.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path strokeLinecap="round" d="M11 18h2" />
      </svg>
    ),
  },
  {
    title: "SMS",
    offDesc:
      "Receive codes by text message. Less secure than an authenticator app, but still better than no second factor.",
    onDesc: "Codes will be sent to ••• ••• 4729. Update your number from Profile.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        />
      </svg>
    ),
  },
];

/* ───────────────────────────── Page ───────────────────────────── */
export default function MyAccountClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const { data: session } = useSession();
  const [showPalette, setShowPalette] = useState(false);

  /* ── Profile (name + email) ── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  // Last-saved baseline — dirty is computed against it so reverting clears the flag.
  const [baseline, setBaseline] = useState({ name: "", email: "" });
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || !session?.user) return;
    const u = session.user;
    const nextName = u.name ?? "";
    const nextEmail = u.email ?? "";
    setName(nextName);
    setEmail(nextEmail);
    setBaseline({ name: nextName, email: nextEmail });
    hydrated.current = true;
  }, [session]);

  const profileDirty = name !== baseline.name || email !== baseline.email;

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const result = await updateBranding({ displayName: name });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setBaseline({ name, email });
      toast.success("Profile updated");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileCancel = () => {
    setName(baseline.name);
    setEmail(baseline.email);
  };

  /* ── Change password (UI-only — no backend yet) ── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const score = useMemo(() => scorePassword(newPw), [newPw]);

  const confirmHint = useMemo(() => {
    if (!confirmPw) return { color: "#6b75a3", text: "Re-type your new password to confirm." };
    if (newPw && confirmPw === newPw) return { color: "#16a34a", text: "Passwords match." };
    return { color: "#b9405a", text: "Passwords don't match yet." };
  }, [newPw, confirmPw]);

  const pwValid =
    currentPw.length >= 1 &&
    newPw.length >= 8 &&
    score >= 2 &&
    newPw === confirmPw &&
    newPw !== currentPw;

  const handlePasswordSave = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Password updated — signed out on other devices");
  };

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="px-4 pt-[22px] pb-14 sm:px-6 lg:px-8">
            <DashboardTopBar
              searchPlaceholder="Search settings…"
              onSearchClick={() => setShowPalette(true)}
            />

            <div style={{ maxWidth: 920, color: "#0b1020", letterSpacing: "-0.01em" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b75a3", marginBottom: 6 }}>
                <Link
                  href="/user-dashboard"
                  style={{ color: "#6b75a3", textDecoration: "none", transition: "color 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1a2244")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b75a3")}
                >
                  Dashboard
                </Link>
                <span style={{ color: "#a8aecb" }}>/</span>
                <span style={{ color: "#0b1020", fontWeight: 500 }}>Account</span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-instrument-serif), "Instrument Serif", Georgia, serif',
                  fontSize: 44,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "#0b1020",
                  fontStyle: "italic",
                  marginBottom: 6,
                }}
              >
                My account.
              </h1>
              <p style={{ fontSize: 14, color: "#3a4474", lineHeight: 1.5, marginBottom: 32, maxWidth: 520 }}>
                Manage your personal details, password, and security settings.
              </p>

              {/* ── Profile ── */}
              <Section>
                <SectionHead
                  title="Profile"
                  desc="Your name and contact email. This stays private — not shown on your public page."
                />
                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={fieldLabel} htmlFor="acc-name">
                        Full name
                      </label>
                      <input
                        id="acc-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={baseInput}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={fieldLabel} htmlFor="acc-email">
                        Email
                      </label>
                      <input
                        id="acc-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={baseInput}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                      <div style={fieldHint}>
                        We&apos;ll send a confirmation link to verify any new email.
                      </div>
                    </div>
                  </div>
                </div>
                <div style={sectionFoot}>
                  <span style={{ marginRight: "auto", fontSize: 12, color: "#6b75a3" }}>
                    {profileDirty ? "You have unsaved changes" : ""}
                  </span>
                  <Btn variant="ghost" onClick={handleProfileCancel} disabled={!profileDirty || savingProfile}>
                    Cancel
                  </Btn>
                  <Btn variant="primary" onClick={handleProfileSave} disabled={!profileDirty || savingProfile}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </Btn>
                </div>
              </Section>

              {/* ── Change password ── */}
              <Section>
                <SectionHead
                  title="Change password"
                  desc="Use a strong, unique password. We'll sign you out of other sessions after you change it."
                />
                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px 16px" }}>
                    <PassField
                      id="pw-current"
                      label="Current password"
                      value={currentPw}
                      onChange={setCurrentPw}
                      autoComplete="current-password"
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px 16px",
                      marginTop: 14,
                    }}
                  >
                    <PassField
                      id="pw-new"
                      label="New password"
                      value={newPw}
                      onChange={setNewPw}
                      autoComplete="new-password"
                    >
                      <StrengthMeter score={score} />
                    </PassField>
                    <PassField
                      id="pw-confirm"
                      label="Confirm new password"
                      value={confirmPw}
                      onChange={setConfirmPw}
                      autoComplete="new-password"
                    >
                      <div style={{ ...fieldHint, color: confirmHint.color }}>{confirmHint.text}</div>
                    </PassField>
                  </div>
                </div>
                <div style={sectionFoot}>
                  <Btn variant="primary" onClick={handlePasswordSave} disabled={!pwValid}>
                    Update password
                  </Btn>
                </div>
              </Section>

              {/* ── Security ── */}
              <Section>
                <SectionHead
                  title="Security"
                  desc="Add a second factor of authentication. We strongly recommend at least one — it'll be required if your account is ever flagged as suspicious."
                />
                <div style={{ padding: "20px 24px 24px" }}>
                  {SECURITY_FACTORS.map((factor) => (
                    <SecRow key={factor.title} factor={factor} />
                  ))}
                </div>
              </Section>

              {/* ── Danger zone ── */}
              <Section danger>
                <SectionHead
                  danger
                  title="Danger zone"
                  desc="Permanent actions. Once done, they cannot be undone."
                />
                <div style={{ padding: "20px 24px 24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0b1020" }}>
                        Delete this account
                      </div>
                      <div style={{ fontSize: 12, color: "#3a4474", marginTop: 2 }}>
                        Permanently delete your linkhub, all your links, and your account data.
                      </div>
                    </div>
                    <Btn variant="dangerGhost" onClick={() => toast.error("Delete account is not enabled yet")}>
                      Delete account
                    </Btn>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </main>
      </CollapsibleSidebar>

      <CommandPalette
        open={showPalette}
        onClose={() => setShowPalette(false)}
        searchPlaceholder="Search settings…"
      />
    </div>
  );
}
