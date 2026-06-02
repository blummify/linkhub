"use client";

import Link from "next/link";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { PlanCard } from "./components/PlanCard";
import { NextPaymentCard } from "./components/NextPaymentCard";
import { UsageSection } from "./components/UsageSection";
import { PaymentMethodsSection } from "./components/PaymentMethodsSection";
import { BillingAddressSection } from "./components/BillingAddressSection";
import { InvoiceHistorySection } from "./components/InvoiceHistorySection";
import { useSidebarStore } from "@/store/sidebarStore";

const FONT_SERIF = "'Instrument Serif', serif";

export default function BillingClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="flex flex-col min-h-screen">
            <div className="flex-1 min-w-0 px-4 pt-[22px] pb-14 sm:px-6 lg:px-8">

              <DashboardTopBar searchPlaceholder="Search billing…" />

              {/* Page heading */}
              <div style={{ marginBottom: 30 }}>
                <nav
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12.5,
                    color: "#6b75a3",
                    marginBottom: 14,
                  }}
                >
                  <Link href="/user-dashboard" style={{ color: "#6b75a3", textDecoration: "none" }}>
                    Dashboard
                  </Link>
                  <span style={{ color: "#a8aecb" }}>/</span>
                  <span style={{ color: "#0b1020" }}>Billing</span>
                </nav>

                <h1
                  style={{
                    fontFamily: FONT_SERIF,
                    fontStyle: "italic",
                    fontSize: 46,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "#0b1020",
                  }}
                >
                  Billing.
                </h1>
                <p style={{ fontSize: 14.5, color: "#6b75a3", marginTop: 10 }}>
                  Your plan, payment, and invoices — all in one place.
                </p>
              </div>

              {/* Bento grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
                className="billing-bento"
              >
                {/* Row 1: Plan (span 2) + Next Payment (span 1) */}
                <div style={{ gridColumn: "span 2" }}>
                  <PlanCard plan="pro" />
                </div>
                <div>
                  <NextPaymentCard />
                </div>

                {/* Row 2: Usage (span 2) — col 3 intentionally empty */}
                <div style={{ gridColumn: "span 2" }}>
                  <UsageSection />
                </div>

                {/* Row 3–5: Full-width cards */}
                <div style={{ gridColumn: "span 3" }}>
                  <PaymentMethodsSection />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <BillingAddressSection />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <InvoiceHistorySection />
                </div>
              </div>

            </div>
          </div>
        </main>
      </CollapsibleSidebar>

      <style>{`
        @media (max-width: 880px) {
          .billing-bento {
            grid-template-columns: 1fr 1fr !important;
          }
          .billing-bento > div[style*="span 2"],
          .billing-bento > div[style*="span 3"],
          .billing-bento > div:not([style]) {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 560px) {
          .billing-bento {
            grid-template-columns: 1fr !important;
          }
          .billing-bento > div[style*="span 2"],
          .billing-bento > div[style*="span 3"],
          .billing-bento > div:not([style]) {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
