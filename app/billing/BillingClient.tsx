"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { toast } from "sonner";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";
import { PlanCard } from "./components/PlanCard";
import { NextPaymentCard } from "./components/NextPaymentCard";
import { UsageSection } from "./components/UsageSection";
import { PaymentMethodsSection, type PaymentCard } from "./components/PaymentMethodsSection";
import { BillingAddressSection } from "./components/BillingAddressSection";
import { InvoiceHistorySection } from "./components/InvoiceHistorySection";
import { BillingModal, ModalBtn } from "./components/BillingModal";
import { useSidebarStore } from "@/store/sidebarStore";

/* ── Plan data ── */
const PLANS = [
  { id: "free",     name: "Free",     price: "$0",  per: "forever",                  desc: "5 links · 1k views · no custom domain" },
  { id: "pro",      name: "Pro",      price: "$12", per: "/ month · billed annually", desc: "100 links · 50k views · 3 domains · 1 GB" },
  { id: "business", name: "Business", price: "$32", per: "/ month · billed annually", desc: "Unlimited links · 500k views · 10 domains · 10 GB" },
] as const;

type PlanId = (typeof PLANS)[number]["id"];
type ModalType = "changePlan" | "cancelSub" | "addCard" | "editCard" | "removeCard";

interface CardFormState { name: string; number: string; expiry: string; cvc: string; error: string }

const INITIAL_CARDS: PaymentCard[] = [
  { id: 1, brand: "visa", last4: "4242", expiry: "08/2028", isDefault: true },
  { id: 2, brand: "mc",   last4: "8881", expiry: "03/2027", isDefault: false },
];

function detectBrand(num: string): PaymentCard["brand"] {
  const n = num.replace(/\s/g, "");
  if (n[0] === "4") return "visa";
  if (n[0] === "5" || n[0] === "2") return "mc";
  return "amex";
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

export default function BillingClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const formId = useId();

  /* ── Billing state ── */
  const [planId, setPlanId] = useState<PlanId>("pro");
  const [canceled, setCanceled] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [nextCardId, setNextCardId] = useState(3);

  /* ── Modal state ── */
  const [modal, setModal] = useState<ModalType | null>(null);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [removingCard, setRemovingCard] = useState<PaymentCard | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(planId);
  const [cardForm, setCardForm] = useState<CardFormState>({ name: "", number: "", expiry: "", cvc: "", error: "" });

  const closeModal = () => { setModal(null); setEditingCard(null); setRemovingCard(null); };

  /* ── Plan handlers ── */
  const openChangePlan = (preselect?: PlanId) => { setSelectedPlan(preselect ?? planId); setModal("changePlan"); };
  const confirmChangePlan = () => { setPlanId(selectedPlan); setCanceled(false); closeModal(); toast(`Switched to ${PLANS.find((p) => p.id === selectedPlan)!.name}`); };
  const openCancelSub = () => setModal("cancelSub");
  const confirmCancelSub = () => { setCanceled(true); closeModal(); toast("Subscription canceled"); };
  const handleResume = () => { setCanceled(false); toast("Subscription resumed"); };

  /* ── Card handlers ── */
  const openAddCard = () => { setCardForm({ name: "", number: "", expiry: "", cvc: "", error: "" }); setEditingCard(null); setModal("addCard"); };
  const openEditCard = (card: PaymentCard) => { setCardForm({ name: "Joel Osei Acquah", number: "", expiry: card.expiry.replace(/(\d\d)\/20(\d\d)/, "$1/$2"), cvc: "", error: "" }); setEditingCard(card); setModal("editCard"); };
  const openRemoveCard = (card: PaymentCard) => { setRemovingCard(card); setModal("removeCard"); };
  const handleMakeDefault = (id: number) => { setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id }))); const c = cards.find((x) => x.id === id)!; toast(`${c.brand === "visa" ? "Visa" : "Mastercard"} ••• ${c.last4} is now default`); };

  const submitCard = () => {
    const { name, number, expiry, cvc } = cardForm;
    const fail = (msg: string) => setCardForm((p) => ({ ...p, error: msg }));
    if (!name.trim()) return fail("Enter the name on the card.");
    if (!/^\d\d\/\d\d$/.test(expiry)) return fail("Expiry must look like MM/YY.");
    if (!/^\d{3,4}$/.test(cvc.trim())) return fail("CVC should be 3 or 4 digits.");
    const expFull = expiry.replace(/(\d\d)\/(\d\d)/, "$1/20$2");
    if (editingCard) {
      setCards((prev) => prev.map((c) => c.id === editingCard.id ? { ...c, expiry: expFull } : c));
      closeModal(); toast("Card updated");
    } else {
      const raw = number.replace(/\s/g, "");
      if (raw.length < 12) return fail("Enter a valid card number.");
      const newCard: PaymentCard = { id: nextCardId, brand: detectBrand(raw), last4: raw.slice(-4), expiry: expFull, isDefault: cards.length === 0 };
      setNextCardId((n) => n + 1);
      setCards((prev) => [...prev, newCard]);
      closeModal(); toast(`${newCard.brand === "visa" ? "Visa" : "Mastercard"} ••• ${newCard.last4} added`);
    }
  };

  const confirmRemoveCard = () => {
    if (!removingCard) return;
    const wasDefault = removingCard.isDefault;
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== removingCard!.id);
      if (wasDefault && next.length) next[0].isDefault = true;
      return next;
    });
    closeModal(); toast("Card removed");
  };

  /* ── Card form field handler ── */
  const setField = (field: keyof CardFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (field === "number") v = formatCardNumber(v);
    if (field === "expiry") v = formatExpiry(v);
    setCardForm((p) => ({ ...p, [field]: v, error: "" }));
  };

  const brandName = (b: PaymentCard["brand"]) => b === "visa" ? "Visa" : b === "mc" ? "Mastercard" : "Amex";

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"} ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1 min-w-0 px-4 pt-[22px] pb-14 sm:px-6 lg:px-8">

              <DashboardTopBar searchPlaceholder="Search billing…" />

              {/* Page heading */}
              <div style={{ marginBottom: 30 }}>
                <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#6b75a3", marginBottom: 14 }}>
                  <Link href="/user-dashboard" style={{ color: "#6b75a3", textDecoration: "none" }}>Dashboard</Link>
                  <span style={{ color: "#a8aecb" }}>/</span>
                  <span style={{ color: "#0b1020" }}>Billing</span>
                </nav>
                <h1 style={{ fontFamily: BRANDING_FONT_SERIF, fontStyle: "italic", fontSize: 46, lineHeight: 1, letterSpacing: "-0.02em", color: "#0b1020" }}>
                  Billing.
                </h1>
                <p style={{ fontSize: 14.5, color: "#6b75a3", marginTop: 10 }}>
                  Your plan, payment, and invoices — all in one place.
                </p>
              </div>

              {/* Bento grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="billing-bento">
                <div style={{ gridColumn: "span 2" }}>
                  <PlanCard plan={planId === "free" ? "free" : "pro"} canceled={canceled} onChangePlan={() => openChangePlan()} onCancelSubscription={openCancelSub} onResumeSubscription={handleResume} />
                </div>
                <div><NextPaymentCard /></div>
                <div style={{ gridColumn: "span 2" }}>
                  <UsageSection onUpgrade={() => openChangePlan("business")} />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <PaymentMethodsSection cards={cards} onAddCard={openAddCard} onMakeDefault={handleMakeDefault} onEditCard={openEditCard} onRemoveCard={openRemoveCard} />
                </div>
                <div style={{ gridColumn: "span 3" }}><BillingAddressSection /></div>
                <div style={{ gridColumn: "span 3" }}><InvoiceHistorySection /></div>
              </div>

            </div>
          </div>
        </main>
      </CollapsibleSidebar>

      {/* ── Change plan modal ── */}
      {modal === "changePlan" && (
        <BillingModal title="Change plan" subtitle="Pick the plan that fits. Changes apply at your next renewal." onClose={closeModal}
          footer={<><ModalBtn onClick={closeModal}>Keep current</ModalBtn><ModalBtn variant="primary" onClick={confirmChangePlan}>Confirm change</ModalBtn></>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
                  padding: "14px 16px", borderRadius: 12, marginBottom: 10,
                  border: selectedPlan === p.id ? "1.5px solid #3b46e0" : "1.5px solid #d6dae9",
                  background: selectedPlan === p.id ? "#f1f3ff" : "white",
                  cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedPlan === p.id ? "#3b46e0" : "#a8aecb"}`, flexShrink: 0, display: "grid", placeItems: "center" }}>
                  {selectedPlan === p.id && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3b46e0", display: "block" }} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1020", display: "flex", alignItems: "center", gap: 8 }}>
                    {p.name}
                    {p.id === planId && <span style={{ fontSize: 9.5, fontWeight: 600, color: "#2a37c0", background: "#e6e9ff", padding: "2px 7px", borderRadius: 99, letterSpacing: "0.04em" }}>CURRENT</span>}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b75a3", marginTop: 2, display: "block" }}>{p.desc}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1020", whiteSpace: "nowrap", fontFamily: "'Geist Mono', monospace" }}>{p.price}</span>
              </button>
            ))}
          </div>
        </BillingModal>
      )}

      {/* ── Cancel subscription modal ── */}
      {modal === "cancelSub" && (
        <BillingModal title="Cancel subscription?" onClose={closeModal}
          footer={<><ModalBtn onClick={closeModal}>Keep subscription</ModalBtn><ModalBtn variant="danger" onClick={confirmCancelSub}>Cancel subscription</ModalBtn></>}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "#fdebef", color: "#e11d48", display: "grid", placeItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
            </span>
            <div style={{ fontSize: 13, color: "#3a4474", lineHeight: 1.55 }}>
              You'll keep Pro features until <strong style={{ color: "#0b1020" }}>December 14, 2026</strong>. After that your account drops to the Free plan — links over the limit will be paused, not deleted.
            </div>
          </div>
        </BillingModal>
      )}

      {/* ── Add / Edit card modal ── */}
      {(modal === "addCard" || modal === "editCard") && (
        <BillingModal
          title={editingCard ? "Edit card" : "Add a card"}
          subtitle={editingCard ? `${brandName(editingCard.brand)} ending in ${editingCard.last4}` : "Your card details are encrypted. This is a demo — no real card is charged."}
          onClose={closeModal}
          footer={<><ModalBtn onClick={closeModal}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={submitCard}>{editingCard ? "Save card" : "Add card"}</ModalBtn></>}
        >
          {cardForm.error && (
            <div style={{ fontSize: 12, color: "#e11d48", background: "#fdebef", borderRadius: 8, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
              {cardForm.error}
            </div>
          )}
          {!editingCard && (
            <div style={{ marginBottom: 14 }}>
              <label htmlFor={`${formId}-num`} style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3a4474", marginBottom: 6 }}>Card number</label>
              <input id={`${formId}-num`} value={cardForm.number} onChange={setField("number")} inputMode="numeric" placeholder="1234 5678 9012 3456" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor={`${formId}-name`} style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3a4474", marginBottom: 6 }}>Name on card</label>
            <input id={`${formId}-name`} value={cardForm.name} onChange={setField("name")} placeholder="Joel Osei Acquah" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label htmlFor={`${formId}-exp`} style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3a4474", marginBottom: 6 }}>Expiry (MM/YY)</label>
              <input id={`${formId}-exp`} value={cardForm.expiry} onChange={setField("expiry")} placeholder="08/28" maxLength={5} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label htmlFor={`${formId}-cvc`} style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3a4474", marginBottom: 6 }}>CVC</label>
              <input id={`${formId}-cvc`} value={cardForm.cvc} onChange={setField("cvc")} inputMode="numeric" placeholder="123" maxLength={4} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>
        </BillingModal>
      )}

      {/* ── Remove card modal ── */}
      {modal === "removeCard" && removingCard && (
        <BillingModal title="Remove this card?" onClose={closeModal}
          footer={<><ModalBtn onClick={closeModal}>Keep card</ModalBtn><ModalBtn variant="danger" onClick={confirmRemoveCard}>Remove card</ModalBtn></>}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "#fdebef", color: "#e11d48", display: "grid", placeItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </span>
            <div style={{ fontSize: 13, color: "#3a4474", lineHeight: 1.55 }}>
              <strong style={{ color: "#0b1020" }}>{brandName(removingCard.brand)} ending in {removingCard.last4}</strong> will be removed.
              {removingCard.isDefault && cards.length > 1 && " Your other card will become the default."}
              {cards.length === 1 && " This is your only card — renewals will fail until you add another."}
            </div>
          </div>
        </BillingModal>
      )}

      <style>{`
        @media (max-width: 880px) {
          .billing-bento { grid-template-columns: 1fr 1fr !important; }
          .billing-bento > div { grid-column: span 2 !important; }
        }
        @media (max-width: 560px) {
          .billing-bento { grid-template-columns: 1fr !important; }
          .billing-bento > div { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #d6dae9", borderRadius: 8,
  padding: "9px 12px", fontSize: 13.5, color: "#0b1020",
  background: "white", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
};
const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#6873ff";
  e.currentTarget.style.boxShadow = "0 0 0 3px #f1f3ff";
};
const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#d6dae9";
  e.currentTarget.style.boxShadow = "none";
};
