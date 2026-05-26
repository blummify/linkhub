"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { useLinksStore } from "@/store/linksStore";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_FONT_SERIF } from "../constants/brandingFonts";

const FREE_LIMIT = 5;

const PRO_FEATURES = [
  "Unlimited links",
  "Advanced analytics & click tracking",
  "Custom branding & themes",
  "Priority support",
  "Custom domain support",
  "Team collaboration",
];

const FREE_FEATURES = [
  `Up to ${FREE_LIMIT} links`,
  "Basic analytics",
  "Default branding",
  "Community support",
];

function CheckIcon({ color = "#16a34a" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BillingClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const linkCount = useLinksStore((s) => s.links.length);
  const router = useRouter();

  const usagePercent = Math.min((linkCount / FREE_LIMIT) * 100, 100);

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="max-w-2xl mx-auto px-4 pt-[22px] pb-14 sm:px-6 lg:px-8">
            <DashboardTopBar searchPlaceholder="Search billing…" />

            {/* Breadcrumb + title */}
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
                <span style={{ color: "#0b1020", fontWeight: 500 }}>Billing</span>
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
                Plans &amp; <em style={{ color: "#3b46e0" }}>billing</em>
              </h1>
              <p style={{ fontSize: 13.5, color: "#6b75a3", marginTop: 6 }}>
                Manage your subscription and usage.
              </p>
            </div>

            {/* Current plan banner */}
            <div
              style={{
                background: "white",
                border: "1px solid #eef0f7",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 99,
                      background: "#f0f4ff",
                      color: "#3b46e0",
                      border: "1px solid #dde1ff",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                    }}
                  >
                    Free
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1020" }}>
                    Current plan
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#6b75a3" }}>
                  You are on the Free plan. Upgrade to unlock more features.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                style={{
                  flexShrink: 0,
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #3b46e0, #6168f5)",
                  color: "white",
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Usage */}
            <div
              style={{
                background: "white",
                border: "1px solid #eef0f7",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
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
                Usage
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "#0b1020" }}>Links</span>
                <span style={{ fontSize: 13, color: "#6b75a3" }}>
                  {linkCount} / {FREE_LIMIT}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "#eef0f7",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${usagePercent}%`,
                    background:
                      usagePercent >= 100
                        ? "#dc2626"
                        : usagePercent >= 80
                        ? "#f59e0b"
                        : "#3b46e0",
                    borderRadius: 99,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              {usagePercent >= 80 && (
                <p
                  style={{
                    fontSize: 12,
                    color: usagePercent >= 100 ? "#dc2626" : "#d97706",
                    marginTop: 8,
                  }}
                >
                  {usagePercent >= 100
                    ? "You've reached your link limit. Upgrade to add more."
                    : "You're approaching your link limit."}
                </p>
              )}
            </div>

            {/* Plan comparison */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 16,
              }}
              className="sm:grid-cols-2"
            >
              {/* Free */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #eef0f7",
                  borderRadius: 16,
                  padding: "20px 20px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b75a3",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Free
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0b1020",
                    marginBottom: 16,
                    letterSpacing: "-0.02em",
                  }}
                >
                  $0
                  <span style={{ fontSize: 14, fontWeight: 400, color: "#6b75a3" }}>/mo</span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {FREE_FEATURES.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckIcon color="#6b75a3" />
                      <span style={{ fontSize: 13, color: "#3a4474" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro */}
              <div
                style={{
                  background: "linear-gradient(160deg, #3b46e0 0%, #2d1e8a 100%)",
                  borderRadius: 16,
                  padding: "20px 20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    filter: "blur(16px)",
                  }}
                />
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Pro
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 16,
                    letterSpacing: "-0.02em",
                  }}
                >
                  $9
                  <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.65)" }}>
                    /mo
                  </span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PRO_FEATURES.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckIcon color="rgba(255,255,255,0.85)" />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/pricing")}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    padding: "11px 0",
                    background: "white",
                    color: "#3b46e0",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  }}
                >
                  Get Pro →
                </button>
              </div>
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>
  );
}
