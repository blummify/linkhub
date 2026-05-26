"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_FONT_SERIF } from "../constants/brandingFonts";
import { updateUserName, changePassword } from "../actions/auth";

const fieldLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#6b75a3",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const baseInput: React.CSSProperties = {
  width: "100%",
  background: "#f7f8fc",
  border: "1px solid #eef0f7",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  color: "#0b1020",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#3b46e0";
  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,70,224,0.12)";
  e.currentTarget.style.background = "white";
}
function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#eef0f7";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.background = "#f7f8fc";
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f7",
        borderRadius: 16,
        padding: "24px 28px",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#6b75a3",
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  );
}

export default function MyAccountClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "";
  const [name, setName] = useState(displayName);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingName, startNameSave] = useTransition();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingPw, startPwSave] = useTransition();

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameMsg(null);
    startNameSave(async () => {
      const res = await updateUserName(name);
      if ("error" in res) {
        setNameMsg({ ok: false, text: res.error });
      } else {
        await updateSession({ name });
        setNameMsg({ ok: true, text: "Name updated." });
      }
    });
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    startPwSave(async () => {
      const res = await changePassword(currentPw, newPw);
      if ("error" in res) {
        setPwMsg({ ok: false, text: res.error });
      } else {
        setPwMsg({ ok: true, text: "Password updated successfully." });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    });
  }

  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="max-w-2xl mx-auto px-4 pt-[22px] pb-14 sm:px-6 lg:px-8">
            <DashboardTopBar searchPlaceholder="Search settings…" />

            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 12.5,
                  color: "#6b75a3",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Link href="/user-dashboard" style={{ color: "#6b75a3", textDecoration: "none" }}>
                  Dashboard
                </Link>
                <span style={{ color: "#d6dae9" }}>/</span>
                <span style={{ color: "#0b1020", fontWeight: 500 }}>My account</span>
              </div>
              <h1
                style={{
                  fontSize: 38,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "#0b1020",
                  fontFamily: BRANDING_FONT_SERIF,
                  fontStyle: "italic",
                  lineHeight: 1.05,
                }}
              >
                My <em style={{ color: "#3b46e0" }}>account</em>
              </h1>
              <p style={{ fontSize: 13.5, color: "#6b75a3", marginTop: 6 }}>
                Manage your profile and security settings.
              </p>
            </div>

            {/* Avatar + summary */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 22,
                    fontWeight: 600,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? "avatar"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#0b1020" }}>
                    {user?.name ?? user?.email?.split("@")[0]}
                  </p>
                  <p style={{ fontSize: 13, color: "#6b75a3", marginTop: 2 }}>{user?.email}</p>
                </div>
              </div>
            </Card>

            {/* Display name */}
            <Card>
              <SectionTitle>Profile</SectionTitle>
              <form onSubmit={handleSaveName}>
                <div style={{ marginBottom: 16 }}>
                  <p style={fieldLabel}>Display name</p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={60}
                    style={baseInput}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={fieldLabel}>Email</p>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    style={{ ...baseInput, opacity: 0.6, cursor: "not-allowed" }}
                  />
                  <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 5 }}>
                    Email cannot be changed.
                  </p>
                </div>
                {nameMsg && (
                  <p
                    style={{
                      fontSize: 13,
                      color: nameMsg.ok ? "#16a34a" : "#dc2626",
                      marginBottom: 12,
                    }}
                  >
                    {nameMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingName || name.trim() === displayName}
                  style={{
                    padding: "10px 20px",
                    background: "#3b46e0",
                    color: "white",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 600,
                    border: "none",
                    cursor: savingName ? "wait" : "pointer",
                    opacity: savingName || name.trim() === displayName ? 0.5 : 1,
                    transition: "opacity 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {savingName ? "Saving…" : "Save changes"}
                </button>
              </form>
            </Card>

            {/* Change password */}
            <Card>
              <SectionTitle>Security</SectionTitle>
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: 14 }}>
                  <p style={fieldLabel}>Current password</p>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={baseInput}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <p style={fieldLabel}>New password</p>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    style={baseInput}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={fieldLabel}>Confirm new password</p>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    style={baseInput}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                {pwMsg && (
                  <p
                    style={{
                      fontSize: 13,
                      color: pwMsg.ok ? "#16a34a" : "#dc2626",
                      marginBottom: 12,
                    }}
                  >
                    {pwMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingPw || !currentPw || !newPw || !confirmPw}
                  style={{
                    padding: "10px 20px",
                    background: "#3b46e0",
                    color: "white",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 600,
                    border: "none",
                    cursor: savingPw ? "wait" : "pointer",
                    opacity: savingPw || !currentPw || !newPw || !confirmPw ? 0.5 : 1,
                    transition: "opacity 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {savingPw ? "Updating…" : "Update password"}
                </button>
              </form>
            </Card>

            {/* Connected accounts */}
            <Card>
              <SectionTitle>Connected accounts</SectionTitle>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#f0f4ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#0b1020" }}>Google</p>
                    <p style={{ fontSize: 12, color: "#6b75a3" }}>Sign in with Google</p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: user?.image ? "#f0fdf4" : "#f7f8fc",
                    color: user?.image ? "#16a34a" : "#9ca3af",
                    border: `1px solid ${user?.image ? "#bbf7d0" : "#eef0f7"}`,
                  }}
                >
                  {user?.image ? "Connected" : "Not linked"}
                </span>
              </div>
            </Card>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>
  );
}
