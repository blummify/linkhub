"use client";

import Link from "next/link";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_FONT_SERIF } from "../constants/brandingFonts";
import { HELP_CENTER_LINKS, HELP_FAQ } from "../constants/helpLinks";

export default function HelpClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="max-w-3xl mx-auto px-4 pt-[22px] pb-14 sm:px-6 lg:px-8">
            <DashboardTopBar searchPlaceholder="Search help articles…" />

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
                <span style={{ color: "#0b1020", fontWeight: 500 }}>Help</span>
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
                How can we <em style={{ color: "#3b46e0" }}>help</em>?
              </h1>
              <p style={{ fontSize: 13.5, color: "#6b75a3", marginTop: 6, maxWidth: 480 }}>
                Guides, shortcuts, and support for your Linkhub workspace.
              </p>
            </div>

            <section style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#6b75a3",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 12,
                }}
              >
                Quick links
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {HELP_CENTER_LINKS.map((item) => {
                  const card = (
                    <div
                      style={{
                        background: "white",
                        border: "1px solid #eef0f7",
                        borderRadius: 14,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0b1020" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 2 }}>
                          {item.description}
                        </div>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b75a3"
                        strokeWidth="2"
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 18l6-6-6-6"
                        />
                      </svg>
                    </div>
                  );

                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        style={{ textDecoration: "none" }}
                        onMouseEnter={(e) => {
                          const inner = e.currentTarget.firstElementChild as HTMLElement;
                          if (inner) {
                            inner.style.borderColor = "#d6dae9";
                            inner.style.boxShadow = "0 4px 12px rgba(15,23,42,0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const inner = e.currentTarget.firstElementChild as HTMLElement;
                          if (inner) {
                            inner.style.borderColor = "#eef0f7";
                            inner.style.boxShadow = "none";
                          }
                        }}
                      >
                        {card}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      style={{ textDecoration: "none" }}
                      onMouseEnter={(e) => {
                        const inner = e.currentTarget.firstElementChild as HTMLElement;
                        if (inner) {
                          inner.style.borderColor = "#d6dae9";
                          inner.style.boxShadow = "0 4px 12px rgba(15,23,42,0.06)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        const inner = e.currentTarget.firstElementChild as HTMLElement;
                        if (inner) {
                          inner.style.borderColor = "#eef0f7";
                          inner.style.boxShadow = "none";
                        }
                      }}
                    >
                      {card}
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <h2
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#6b75a3",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 12,
                }}
              >
                Frequently asked
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {HELP_FAQ.map((item) => (
                  <div
                    key={item.question}
                    style={{
                      background: "white",
                      border: "1px solid #eef0f7",
                      borderRadius: 14,
                      padding: "16px 18px",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0b1020" }}>
                      {item.question}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6b75a3",
                        marginTop: 6,
                        lineHeight: 1.55,
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>
  );
}
