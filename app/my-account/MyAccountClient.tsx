"use client";

// My account settings page. Styled with Tailwind utilities + ink/indigo/paper
// theme tokens. Personal info, email change (code-verified), password, and
// account deletion are wired to server actions in app/actions/account.ts.
// The Security/2FA section remains a demo (UI-only, not persisted).

import { useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { CommandPalette } from "../components/CommandPalette";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { scorePassword, passwordsMatch, PASSWORD_STRENGTH_LABELS } from "@/lib/validation/auth.schema";
import {
  updateName,
  requestEmailChange,
  confirmEmailChange,
  cancelEmailChange,
  resendEmailChangeCode,
  changePassword,
  setPassword as setPasswordAction,
  armOAuthDeletion,
  deleteAccount,
} from "@/app/actions/account";

type AccountInitial = {
  name: string;
  email: string;
  pendingEmail: string | null;
  hasPassword: boolean;
};

/* ───────────────── Section card primitives ───────────────── */
function Section({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <section
      className={
        danger
          ? "mt-6 overflow-hidden rounded-2xl border border-rose-500/[0.18] bg-danger-50"
          : "mb-4 overflow-hidden rounded-2xl border border-ink-100 bg-white"
      }
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
    <div className={`px-6 pt-5 ${danger ? "pb-2" : "pb-1"} ${actions ? "flex items-start justify-between gap-4" : ""}`}>
      <div>
        <div className={`text-base font-semibold tracking-[-0.015em] ${danger ? "text-rose-600" : "text-ink-900"}`}>
          {title}
        </div>
        <div className={`mt-1 text-[12.5px] leading-[1.45] ${danger ? "text-rose-500/70" : "text-ink-400"}`}>{desc}</div>
      </div>
      {actions}
    </div>
  );
}

/* ───────────────── Field ───────────────── */
const INPUT_CLASS =
  "w-full rounded-[12px] border border-ink-100 bg-paper px-[14px] py-[11px] text-[14px] text-ink-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-400/[0.12]";

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-500" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} />
      {hint && <div className="mt-0.5 text-[11.5px] text-ink-400">{hint}</div>}
    </div>
  );
}

/* ───────────────── Edit icon button ───────────────── */
function EditIconBtn({ editing, onClick }: { editing: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={editing ? "Close" : "Edit"}
      className="w-9 h-9 shrink-0 self-center rounded-full border border-ink-100 text-ink-400 grid place-items-center transition-colors hover:bg-paper hover:border-ink-200 hover:text-ink-700"
    >
      {editing ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z" />
        </svg>
      )}
    </button>
  );
}

/* ───────────────── Button ───────────────── */
type BtnVariant = "primary" | "ghost" | "secondary" | "danger";

const BTN_BASE =
  "inline-flex items-center gap-[7px] rounded-[12px] px-4 py-[9px] text-[13px] font-medium tracking-[-0.005em] transition cursor-pointer disabled:cursor-not-allowed";
const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary:
    "bg-indigo-500 text-white shadow-[0_4px_12px_-4px_rgba(59,70,224,0.4)] hover:bg-indigo-600 hover:-translate-y-px disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 disabled:hover:bg-indigo-500",
  ghost:
    "border border-ink-100 text-ink-700 hover:bg-paper hover:border-ink-200 hover:text-ink-900 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-ink-100",
  secondary: "bg-ink-100 text-ink-700 hover:bg-ink-200 hover:text-ink-900",
  danger: "border border-rose-500/20 text-rose-600 hover:bg-danger-50 hover:border-rose-500/40",
};

function Button({
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
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${BTN_BASE} ${BTN_VARIANTS[variant]}`}>
      {children}
    </button>
  );
}

/* ───────────────── Password strength meter ───────────────── */
// Bar fill + label color per score.
function strengthColors(score: number): { bar: string; label: string } {
  if (score >= 4) return { bar: "bg-green-600", label: "text-green-600" };
  if (score === 3) return { bar: "bg-lime-500", label: "text-lime-600" };
  if (score === 2) return { bar: "bg-amber-600", label: "text-amber-600" };
  if (score === 1) return { bar: "bg-rose-600", label: "text-rose-600" };
  return { bar: "bg-ink-100", label: "text-ink-400" };
}

function StrengthMeter({ score }: { score: number }) {
  const { bar, label } = strengthColors(score);
  return (
    <div className="mt-2 flex flex-col gap-[5px]">
      <div className="grid grid-cols-4 gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 rounded-[2px] transition-colors ${i < score ? bar : "bg-ink-100"}`} />
        ))}
      </div>
      <div className="flex justify-between text-[11.5px] text-ink-400">
        <span>Password strength</span>
        <span className={score > 0 ? label : "text-ink-400"}>{PASSWORD_STRENGTH_LABELS[score]}</span>
      </div>
    </div>
  );
}

/* ───────────────── Password field with per-field show/hide ───────────────── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-500" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_CLASS} pr-[38px]`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 grid -translate-y-1/2 place-items-center p-1 text-ink-400 transition-colors hover:text-ink-700"
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

const BADGE_BASE = "inline-flex items-center gap-1 rounded-full px-[7px] py-0.5 text-[10px] font-semibold tracking-[0.04em]";
const BADGE_VARIANTS: Record<"on" | "off" | "recommended", string> = {
  on: "bg-success-50 text-green-600",
  off: "bg-ink-100 text-ink-500",
  recommended: "bg-indigo-50 text-indigo-600",
};

function Badge({ kind, children }: { kind: "on" | "off" | "recommended"; children: ReactNode }) {
  return (
    <span className={`${BADGE_BASE} ${BADGE_VARIANTS[kind]}`}>
      {kind !== "recommended" && (
        <span className={`h-[5px] w-[5px] rounded-full ${kind === "on" ? "bg-green-600" : "bg-ink-400"}`} />
      )}
      {children}
    </span>
  );
}

function SecRow({ factor }: { factor: SecFactor }) {
  // Demo-only: enrollment state is local, not persisted.
  const [enabled, setEnabled] = useState(false);
  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      toast.success(next ? "Second factor enabled" : "Second factor removed");
      return next;
    });
  };
  return (
    <div className="mb-2.5 flex items-center gap-4 rounded-[12px] border border-ink-100 bg-paper p-4 last:mb-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-ink-100 bg-white text-ink-500 [&_svg]:size-[18px]">
        {factor.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2 text-[14px] font-medium text-ink-900">
          {factor.title}
          {factor.recommended && <Badge kind="recommended">Recommended</Badge>}
          <Badge kind={enabled ? "on" : "off"}>{enabled ? "Active" : "Not set up"}</Badge>
        </div>
        <div className="text-xs leading-[1.45] text-ink-400">{enabled ? factor.onDesc : factor.offDesc}</div>
      </div>
      <Button variant={enabled ? "secondary" : "ghost"} onClick={toggle}>
        {enabled ? "Manage" : "Set up"}
      </Button>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        />
      </svg>
    ),
  },
];

/* ───────────────── Delete account dialog ───────────────── */
function DeleteAccountDialog({
  open,
  email,
  hasPassword,
  reauthReady,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  email: string;
  hasPassword: boolean;
  /** True once an OAuth user has returned from the Google re-prompt with a nonce. */
  reauthReady: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: (typedEmail: string, password: string) => void;
}) {
  // Fields reset on open via a `key` remount from the parent — no effect needed.
  const [typedEmail, setTypedEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const emailMatches = typedEmail.trim() === email;
  // Credential users always confirm in one step (email + password).
  // OAuth users: first step starts the Google re-prompt (email only); after
  // returning (reauthReady) the same button finalises the deletion.
  const armed = emailMatches && (hasPassword ? password.length > 0 : true);

  const confirmLabel = hasPassword
    ? "Delete account"
    : reauthReady
    ? "Delete account"
    : "Continue with Google";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-6"
      style={{ background: "rgba(11,16,32,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="relative flex w-full flex-col"
        style={{
          maxWidth: 440,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: "dlgIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          padding: "28px 28px 24px",
        }}
      >
        <div
          className="mb-5 flex shrink-0 items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: "50%", background: "#fde8ec", color: "#e11d48" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
            />
          </svg>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b1020", marginBottom: 8, letterSpacing: "-0.01em" }}>
          Delete your account?
        </h2>
        <p style={{ fontSize: 14, color: "#6b75a3", lineHeight: 1.55, marginBottom: 18 }}>
          This permanently deletes your linkhub, all your links, profile, billing, and account data. This cannot be
          undone.
        </p>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-500" htmlFor="del-email">
              Type your email <span className="text-ink-700">{email}</span> to confirm
            </label>
            <input
              id="del-email"
              type="email"
              autoComplete="off"
              value={typedEmail}
              onChange={(e) => setTypedEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder={email}
            />
          </div>

          {hasPassword && (
            <PassField
              id="del-password"
              label="Enter your current password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          )}

          {!hasPassword && !reauthReady && (
            <p className="text-[11.5px] text-ink-400">
              You&apos;ll be asked to re-confirm with Google before the account is deleted.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 transition-all"
            style={{
              padding: "10px 0",
              borderRadius: 99,
              border: 0,
              background: "#eef0f7",
              color: "#1a2244",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(typedEmail, password)}
            disabled={busy || !armed}
            className="flex-1 transition-all"
            style={{
              padding: "10px 0",
              borderRadius: 99,
              border: 0,
              background: "linear-gradient(180deg, #e11d48, #be123c)",
              color: "white",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: busy || !armed ? "not-allowed" : "pointer",
              opacity: busy || !armed ? 0.5 : 1,
              boxShadow: "0 4px 14px -4px rgba(225,29,72,0.5)",
              fontFamily: "inherit",
            }}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */
export default function MyAccountClient({ initial }: { initial: AccountInitial }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const { update } = useSession();
  const router = useRouter();
  const [showPalette, setShowPalette] = useState(false);

  /* ── Per-section editing state ── */
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState(false);

  /* ── Name ── */
  const [name, setName] = useState(initial.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const nameDirty = name.trim() !== initial.name.trim();

  const handleNameSave = async () => {
    setSavingProfile(true);
    try {
      const result = await updateName(name);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      await update({ name: name.trim() });
      setEditingProfile(false);
      router.refresh();
      toast.success("Name updated");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNameCancel = () => {
    setName(initial.name);
    setEditingProfile(false);
  };

  /* ── Email change ── */
  type EmailMode = "view" | "enterNew" | "enterCode";
  const [emailMode, setEmailMode] = useState<EmailMode>(initial.pendingEmail ? "enterCode" : "view");
  const [pendingEmail, setPendingEmail] = useState<string | null>(initial.pendingEmail);
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  const handleRequestEmail = async () => {
    setEmailBusy(true);
    try {
      const result = await requestEmailChange(newEmail);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setPendingEmail(newEmail.trim());
      setNewEmail("");
      setEmailCode("");
      setEmailMode("enterCode");
      toast.success("We sent a 6-digit code to your new email");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleConfirmEmail = async () => {
    setEmailBusy(true);
    try {
      const result = await confirmEmailChange(emailCode);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      await update({ email: result.email });
      setPendingEmail(null);
      setEmailCode("");
      setEmailMode("view");
      router.refresh();
      toast.success("Email updated");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleResendEmail = async () => {
    setEmailBusy(true);
    try {
      const result = await resendEmailChangeCode();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("New code sent");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleCancelEmail = async () => {
    setEmailBusy(true);
    try {
      const result = await cancelEmailChange();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setPendingEmail(null);
      setNewEmail("");
      setEmailCode("");
      setEmailMode("view");
      toast.success("Email change cancelled");
    } finally {
      setEmailBusy(false);
    }
  };

  /* ── Password (branch on initial.hasPassword from the server) ── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const score = useMemo(() => scorePassword(newPw), [newPw]);

  const confirmHint = useMemo(() => {
    if (!confirmPw) return { cls: "text-ink-400", text: "Re-type your new password to confirm." };
    if (newPw && passwordsMatch(newPw, confirmPw)) return { cls: "text-green-600", text: "Passwords match." };
    return { cls: "text-danger-400", text: "Passwords don't match yet." };
  }, [newPw, confirmPw]);

  const baseValid = newPw.length >= 8 && score >= 2 && passwordsMatch(newPw, confirmPw);
  const pwValid = initial.hasPassword
    ? currentPw.length >= 1 && baseValid && newPw !== currentPw
    : baseValid;

  const clearPwFields = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const handlePasswordSave = async () => {
    setSavingPw(true);
    try {
      const result = initial.hasPassword
        ? await changePassword(currentPw, newPw)
        : await setPasswordAction(newPw);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      clearPwFields();
      setEditingPassword(false);
      router.refresh(); // flips hasPassword for OAuth users who just set one
      toast.success(initial.hasPassword ? "Password updated" : "Password set");
    } finally {
      setSavingPw(false);
    }
  };

  const handlePasswordCancel = () => {
    clearPwFields();
    setEditingPassword(false);
  };

  /* ── Account deletion ── */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reauthNonce, setReauthNonce] = useState<string | null>(null);

  // OAuth users return here from the Google re-prompt with ?del=<nonce>.
  // Re-open the dialog (state was lost across the redirect) and clean the URL.
  useEffect(() => {
    const nonce = new URLSearchParams(window.location.search).get("del");
    if (nonce) {
      window.history.replaceState(null, "", "/my-account");
      // Defer the state writes out of the effect body (matches the codebase's
      // queueMicrotask convention; avoids cascading-render lint).
      queueMicrotask(() => {
        setReauthNonce(nonce);
        setDeleteOpen(true);
      });
    }
  }, []);

  const handleDeleteConfirm = async (typedEmail: string, password: string) => {
    setDeleting(true);
    try {
      if (!initial.hasPassword && !reauthNonce) {
        // OAuth user, first step: start a fresh Google re-prompt bound to a
        // server-side nonce. Force the account picker + consent.
        const armed = await armOAuthDeletion();
        if ("error" in armed) {
          toast.error(armed.error);
          setDeleting(false);
          return;
        }
        await signIn(
          "google",
          { callbackUrl: `/my-account?del=${armed.nonce}` },
          { prompt: "consent select_account" }
        );
        return; // redirecting away
      }

      const result = initial.hasPassword
        ? await deleteAccount({ typedEmail, password })
        : await deleteAccount({ typedEmail, nonce: reauthNonce ?? undefined });

      if ("error" in result) {
        toast.error(result.error);
        setDeleting(false);
        return;
      }

      toast.success("Your account has been deleted");
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-paper antialiased">
      <CollapsibleSidebar>
        <main
          className={`h-screen flex-1 overflow-y-auto bg-paper transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0`}
        >
          <div className="px-4 pt-[22px] pb-24 lg:pb-14 sm:px-6 lg:px-8">
            <DashboardTopBar searchPlaceholder="Search settings…" onSearchClick={() => setShowPalette(true)} />

            <div className="max-w-[920px] tracking-[-0.01em] text-ink-900">
              {/* Header */}
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                <Link href="/user-dashboard" className="text-ink-400 transition-colors hover:text-ink-700">
                  Dashboard
                </Link>
                <span className="text-ink-300">/</span>
                <span className="font-medium text-ink-900">Account</span>
              </div>
              <h1 className="mb-1.5 font-['Instrument_Serif'] text-[44px] italic leading-[1.05] tracking-[-0.02em] text-ink-900">
                My account.
              </h1>
              <p className="mb-8 max-w-[520px] text-[14px] leading-normal text-ink-500">
                Manage your personal details, password, and security settings.
              </p>

              {/* ── Personal info ── */}
              <Section>
                <SectionHead
                  title="Personal info"
                  desc="Your name and contact email. This stays private — not shown on your public page."
                  actions={
                    <EditIconBtn
                      editing={editingProfile}
                      onClick={editingProfile ? handleNameCancel : () => setEditingProfile(true)}
                    />
                  }
                />

                {/* Name */}
                {editingProfile ? (
                  <>
                    <div className="px-6 pt-4 pb-2">
                      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                        <Field id="acc-name" label="Full name" value={name} onChange={setName} />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2.5 border-t border-ink-100 bg-paper px-6 py-3.5">
                      <span className="mr-auto text-xs text-ink-400">{nameDirty ? "Unsaved changes" : ""}</span>
                      <Button variant="ghost" onClick={handleNameCancel} disabled={savingProfile}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleNameSave} disabled={!nameDirty || savingProfile}>
                        {savingProfile ? "Saving…" : "Save changes"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="px-6 pb-4 pt-1">
                    <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400 mb-0.5">Name</div>
                    <div className="text-[13.5px] text-ink-900">{name || "—"}</div>
                  </div>
                )}

                {/* Email */}
                <div className="border-t border-ink-100 px-6 py-5">
                  <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400 mb-0.5">Email</div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[13.5px] text-ink-900">{initial.email || "—"}</div>
                    {emailMode === "view" && !pendingEmail && (
                      <Button variant="ghost" onClick={() => setEmailMode("enterNew")}>
                        Change email
                      </Button>
                    )}
                  </div>

                  {/* Enter a new address */}
                  {emailMode === "enterNew" && (
                    <div className="mt-4 flex flex-col gap-3">
                      <Field
                        id="acc-new-email"
                        label="New email address"
                        type="email"
                        value={newEmail}
                        onChange={setNewEmail}
                        hint="Your current email stays active until you confirm the new one."
                      />
                      <div className="flex items-center justify-end gap-2.5">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setNewEmail("");
                            setEmailMode("view");
                          }}
                          disabled={emailBusy}
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={handleRequestEmail} disabled={emailBusy || !newEmail.trim()}>
                          {emailBusy ? "Sending…" : "Send code"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pending confirmation banner + code entry */}
                  {pendingEmail && emailMode === "enterCode" && (
                    <div className="mt-4 rounded-[12px] border border-amber-500/25 bg-amber-50 p-4">
                      <div className="text-[12.5px] text-amber-700">
                        Confirm <span className="font-semibold">{pendingEmail}</span> — we sent a 6-digit code to that
                        inbox. It expires in 1 hour.
                      </div>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex flex-1 flex-col gap-1.5">
                          <label className="text-xs font-medium text-ink-500" htmlFor="acc-email-code">
                            Verification code
                          </label>
                          <input
                            id="acc-email-code"
                            inputMode="numeric"
                            maxLength={6}
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className={`${INPUT_CLASS} tracking-[0.3em]`}
                            placeholder="••••••"
                          />
                        </div>
                        <Button variant="primary" onClick={handleConfirmEmail} disabled={emailBusy || emailCode.length !== 6}>
                          {emailBusy ? "Confirming…" : "Confirm"}
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-[12px]">
                        <button
                          type="button"
                          onClick={handleResendEmail}
                          disabled={emailBusy}
                          className="font-medium text-indigo-600 hover:underline disabled:opacity-40"
                        >
                          Resend code
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEmail}
                          disabled={emailBusy}
                          className="font-medium text-ink-500 hover:text-ink-700 disabled:opacity-40"
                        >
                          Cancel change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Password ── */}
              <Section>
                <SectionHead
                  title={initial.hasPassword ? "Change password" : "Set a password"}
                  desc={
                    initial.hasPassword
                      ? "Use a strong, unique password. We'll sign you out of other sessions after you change it."
                      : "You sign in with Google. Set a password to also be able to sign in with your email."
                  }
                  actions={
                    <EditIconBtn
                      editing={editingPassword}
                      onClick={editingPassword ? handlePasswordCancel : () => setEditingPassword(true)}
                    />
                  }
                />
                {editingPassword ? (
                  <>
                    <div className="px-6 pt-4 pb-6">
                      {initial.hasPassword && (
                        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5">
                          <PassField
                            id="pw-current"
                            label="Current password"
                            value={currentPw}
                            onChange={setCurrentPw}
                            autoComplete="current-password"
                          />
                        </div>
                      )}
                      <div className={`grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 ${initial.hasPassword ? "mt-3.5" : ""}`}>
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
                          <div className={`mt-0.5 text-[11.5px] ${confirmHint.cls}`}>{confirmHint.text}</div>
                        </PassField>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2.5 border-t border-ink-100 bg-paper px-6 py-3.5">
                      <Button variant="ghost" onClick={handlePasswordCancel} disabled={savingPw}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handlePasswordSave} disabled={!pwValid || savingPw}>
                        {savingPw ? "Saving…" : initial.hasPassword ? "Update password" : "Set password"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="px-6 pb-5 pt-1">
                    <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400 mb-0.5">
                      Password
                    </div>
                    {initial.hasPassword ? (
                      <div className="text-[18px] leading-none tracking-[0.18em] text-ink-300">••••••••••</div>
                    ) : (
                      <div className="text-[13.5px] text-ink-400">No password set — you sign in with Google.</div>
                    )}
                  </div>
                )}
              </Section>

              {/* ── Security (demo only) ── */}
              <Section>
                <SectionHead
                  title="Security"
                  desc="Add a second factor of authentication. We strongly recommend at least one — it'll be required if your account is ever flagged as suspicious."
                  actions={<EditIconBtn editing={editingSecurity} onClick={() => setEditingSecurity((v) => !v)} />}
                />
                {editingSecurity ? (
                  <div className="px-6 pt-4 pb-6">
                    {SECURITY_FACTORS.map((factor) => (
                      <SecRow key={factor.title} factor={factor} />
                    ))}
                  </div>
                ) : (
                  <div className="px-6 pb-5 pt-1">
                    <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400 mb-0.5">
                      Two-factor authentication
                    </div>
                    <div className="text-[13.5px] text-ink-400">No second factors active</div>
                  </div>
                )}
              </Section>

              {/* ── Danger zone ── */}
              <Section danger>
                <SectionHead danger title="Danger zone" desc="Permanent actions. Once done, they cannot be undone." />
                <div className="px-6 pt-5 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[13.5px] font-medium text-ink-900">Delete this account</div>
                      <div className="mt-0.5 text-xs text-ink-500">
                        Permanently delete your linkhub, all your links, and your account data.
                      </div>
                    </div>
                    <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                      Delete account
                    </Button>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </main>
      </CollapsibleSidebar>

      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} searchPlaceholder="Search settings…" />

      <DeleteAccountDialog
        key={deleteOpen ? "delete-open" : "delete-closed"}
        open={deleteOpen}
        email={initial.email}
        hasPassword={initial.hasPassword}
        reauthReady={reauthNonce != null}
        busy={deleting}
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setReauthNonce(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
