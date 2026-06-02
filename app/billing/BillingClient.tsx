"use client";

import { useState, useCallback, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  getSubscription,
  getInvoices,
  createCheckoutSession,
  cancelSubscription,
  type SubscriptionDTO,
  type InvoiceDTO,
  type CardDTO,
} from "@/app/actions/billing";

/* ── Plan selector data (UI only — no secrets) ──────────────────────────── */
const PLANS = [
  { id: "free",     name: "Free",     price: "$0",  per: "forever",                  desc: "5 links · 1k views · no custom domain" },
  { id: "pro",      name: "Pro",      price: "$12", per: "/ month · billed annually", desc: "100 links · 50k views · 3 domains · 1 GB" },
  { id: "business", name: "Business", price: "$32", per: "/ month · billed annually", desc: "Unlimited links · 500k views · 10 domains · 10 GB" },
] as const;

type PlanId = (typeof PLANS)[number]["id"];
type ModalType = "changePlan" | "cancelSub" | "addCard" | "editCard" | "removeCard";

/* ── Convert a CardDTO from the server into the local PaymentCard shape ── */
function cardDtoToPaymentCard(card: CardDTO): PaymentCard {
  const b = card.brand.toLowerCase();
  return {
    id: 1,
    brand: b === "mastercard" ? "mc" : b === "amex" ? "amex" : "visa",
    last4: card.last4,
    expiry: card.expiry,
    isDefault: true,
  };
}

interface CardFormState { name: string; number: string; expiry: string; cvc: string; error: string }

const BRAND_NAMES: Record<PaymentCard["brand"], string> = { visa: "Visa", mc: "Mastercard", amex: "Amex" };
function brandName(b: PaymentCard["brand"]) { return BRAND_NAMES[b]; }

function detectBrand(num: string): PaymentCard["brand"] {
  const n = num.replace(/\s/g, "");
  if (n[0] === "4") return "visa";
  if (n[0] === "5" || n[0] === "2") return "mc";
  return "amex";
}
function formatCardNumber(v: string) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
function formatExpiry(v: string) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; }

/* ── Component ──────────────────────────────────────────────────────────── */
export default function BillingClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const router = useRouter();
  const formId = useId();

  /* ── Live subscription state ── */
  const [subscription, setSubscription] = useState<SubscriptionDTO | null>(null);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  /* ── Card state — seeded from the subscription's stored card on load ── */
  const [cards, setCards]           = useState<PaymentCard[]>([]);
  const [nextCardId, setNextCardId] = useState(2);

  /* ── Modal state ── */
  const [modal, setModal]               = useState<ModalType | null>(null);
  const [editingCard, setEditingCard]   = useState<PaymentCard | null>(null);
  const [removingCard, setRemovingCard] = useState<PaymentCard | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
  const [cardForm, setCardForm] = useState<CardFormState>({ name: "", number: "", expiry: "", cvc: "", error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Load subscription + invoices on mount ── */
  useEffect(() => {
    getSubscription()
      .then((sub) => {
        setSubscription(sub);
        // Seed the card list from the stored card on the subscription.
        // Free users (null sub) or subscribers with no card on file get an empty list.
        if (sub?.card) {
          setCards([cardDtoToPaymentCard(sub.card)]);
        }
      })
      .catch(() => toast.error("Could not load subscription info."))
      .finally(() => setIsLoadingSub(false));

    getInvoices()
      .then((inv) => setInvoices(inv))
      .catch(() => {})
      .finally(() => setIsLoadingInvoices(false));
  }, []);

  /* ── Derived plan state ── */
  const planId = (subscription?.planId ?? "free") as PlanId;
  const canceled = subscription?.cancelAtPeriodEnd ?? false;
  const isPastDue = subscription?.status === "past_due";

  /* ── Modal helpers ── */
  const closeModal = useCallback(() => {
    setModal(null);
    setEditingCard(null);
    setRemovingCard(null);
    setIsSubmitting(false);
  }, []);

  /* ── Plan handlers ── */
  const openChangePlan = useCallback((preselect?: PlanId) => {
    setSelectedPlan(preselect ?? planId);
    setModal("changePlan");
  }, [planId]);

  const confirmChangePlan = useCallback(async () => {
    if (selectedPlan === planId) { closeModal(); return; }
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    setIsSubmitting(true);
    try {
      const planCode = selectedPlan === "pro"
        ? (process.env.NEXT_PUBLIC_PAYSTACK_PRO_MONTHLY_PLAN_CODE ?? "")
        : (process.env.NEXT_PUBLIC_PAYSTACK_PRO_ANNUAL_PLAN_CODE ?? "");

      const { url } = await createCheckoutSession(planCode);
      closeModal();
      router.push(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout.");
      setIsSubmitting(false);
    }
  }, [selectedPlan, planId, closeModal, router]);

  const openCancelSub   = useCallback(() => setModal("cancelSub"), []);
  const handleResume    = useCallback(() => toast("To resume, please contact support."), []);

  const confirmCancelSub = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await cancelSubscription();
      setSubscription((prev) => prev ? { ...prev, cancelAtPeriodEnd: true, status: "non-renewing" } : prev);
      closeModal();
      toast("Subscription will cancel at the end of the billing period.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel subscription.");
      setIsSubmitting(false);
    }
  }, [closeModal]);

  /* ── Card handlers (local state) ── */
  const openAddCard = useCallback(() => {
    setCardForm({ name: "", number: "", expiry: "", cvc: "", error: "" });
    setEditingCard(null);
    setModal("addCard");
  }, []);

  const openEditCard = useCallback((card: PaymentCard) => {
    setCardForm({ name: "", number: "", expiry: card.expiry.replace(/(\d\d)\/20(\d\d)/, "$1/$2"), cvc: "", error: "" });
    setEditingCard(card);
    setModal("editCard");
  }, []);

  const openRemoveCard = useCallback((card: PaymentCard) => {
    setRemovingCard(card);
    setModal("removeCard");
  }, []);

  const handleMakeDefault = useCallback((id: number) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (card) toast(`${brandName(card.brand)} ••• ${card.last4} is now default`);
      return prev;
    });
  }, []);

  const submitCard = useCallback(() => {
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
      const brand = detectBrand(raw);
      const newCard: PaymentCard = { id: nextCardId, brand, last4: raw.slice(-4), expiry: expFull, isDefault: cards.length === 0 };
      setNextCardId((n) => n + 1);
      setCards((prev) => [...prev, newCard]);
      closeModal(); toast(`${brandName(brand)} ••• ${newCard.last4} added`);
    }
  }, [cardForm, editingCard, cards.length, nextCardId, closeModal]);

  const confirmRemoveCard = useCallback(() => {
    if (!removingCard) return;
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== removingCard.id);
      return removingCard.isDefault && next.length > 0
        ? [{ ...next[0], isDefault: true }, ...next.slice(1)]
        : next;
    });
    closeModal(); toast("Card removed");
  }, [removingCard, closeModal]);

  const setField = useCallback((field: keyof CardFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (field === "number") v = formatCardNumber(v);
      if (field === "expiry") v = formatExpiry(v);
      setCardForm((p) => ({ ...p, [field]: v, error: "" }));
    }, []);

  /* ── Render ── */
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

              {/* Past-due payment failed banner */}
              {isPastDue && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 mb-4 text-[13px] text-rose-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" />
                  </svg>
                  Payment failed — please update your payment method to keep Pro access.
                </div>
              )}

              {/* Bento grid — responsive rules in globals.css */}
              <div
                className="billing-bento"
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
              >
                <div style={{ gridColumn: "span 2" }}>
                  {isLoadingSub ? (
                    <div className="h-[160px] bg-[#eef0f7] rounded-2xl animate-pulse" />
                  ) : (
                    <PlanCard
                      plan={planId === "free" ? "free" : "pro"}
                      canceled={canceled}
                      onChangePlan={() => openChangePlan()}
                      onCancelSubscription={openCancelSub}
                      onResumeSubscription={handleResume}
                    />
                  )}
                </div>
                <div>
                  <NextPaymentCard
                    amount={planId === "pro" ? "$144.00" : null}
                    dueDate={subscription?.currentPeriodEnd ?? null}
                    cardBrand={cards.find((c) => c.isDefault)?.brand}
                    cardLast4={cards.find((c) => c.isDefault)?.last4}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <UsageSection onUpgrade={() => openChangePlan("business")} />
                </div>

                <div style={{ gridColumn: "span 3" }}>
                  <PaymentMethodsSection
                    cards={cards}
                    onAddCard={openAddCard}
                    onMakeDefault={handleMakeDefault}
                    onEditCard={openEditCard}
                    onRemoveCard={openRemoveCard}
                  />
                </div>
                <div style={{ gridColumn: "span 3" }}><BillingAddressSection /></div>
                <div style={{ gridColumn: "span 3" }}>
                  <InvoiceHistorySection
                    invoices={invoices}
                    isLoading={isLoadingInvoices}
                  />
                </div>
              </div>

            </div>
          </div>
        </main>
      </CollapsibleSidebar>

      {/* ── Change plan modal ── */}
      {modal === "changePlan" && (
        <BillingModal
          title="Change plan"
          subtitle="Pick the plan that fits. Changes apply at your next renewal."
          onClose={closeModal}
          footer={
            <>
              <ModalBtn onClick={closeModal}>Keep current</ModalBtn>
              <ModalBtn variant="primary" onClick={confirmChangePlan} disabled={isSubmitting}>
                {isSubmitting ? "Redirecting…" : "Confirm change"}
              </ModalBtn>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 12, marginBottom: 10, border: selectedPlan === p.id ? "1.5px solid #3b46e0" : "1.5px solid #d6dae9", background: selectedPlan === p.id ? "#f1f3ff" : "white", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
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
        <BillingModal
          title="Cancel subscription?"
          onClose={closeModal}
          footer={
            <>
              <ModalBtn onClick={closeModal}>Keep subscription</ModalBtn>
              <ModalBtn variant="danger" onClick={confirmCancelSub} disabled={isSubmitting}>
                {isSubmitting ? "Canceling…" : "Cancel subscription"}
              </ModalBtn>
            </>
          }
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "#fdebef", color: "#e11d48", display: "grid", placeItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
            </span>
            <p style={{ fontSize: 13, color: "#3a4474", lineHeight: 1.55 }}>
              You&apos;ll keep Pro features until the end of the current billing period. After that your account drops to Free — links over the limit will be paused, not deleted.
            </p>
          </div>
        </BillingModal>
      )}

      {/* ── Add / Edit card modal ── */}
      {(modal === "addCard" || modal === "editCard") && (
        <BillingModal
          title={editingCard ? "Edit card" : "Add a card"}
          subtitle={editingCard ? `${brandName(editingCard.brand)} ending in ${editingCard.last4}` : "This is a demo — no real card is charged."}
          onClose={closeModal}
          footer={
            <>
              <ModalBtn onClick={closeModal}>Cancel</ModalBtn>
              <ModalBtn variant="primary" onClick={submitCard}>{editingCard ? "Save card" : "Add card"}</ModalBtn>
            </>
          }
        >
          {cardForm.error && (
            <div className="flex items-center gap-2 text-[12px] text-[#e11d48] bg-[#fdebef] rounded-lg px-3 py-[9px] mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
              {cardForm.error}
            </div>
          )}
          {!editingCard && (
            <div className="mb-3">
              <label htmlFor={`${formId}-num`} className="block text-[12px] font-medium text-[#3a4474] mb-1.5">Card number</label>
              <input id={`${formId}-num`} value={cardForm.number} onChange={setField("number")} inputMode="numeric" placeholder="1234 5678 9012 3456" className={inputCls} />
            </div>
          )}
          <div className="mb-3">
            <label htmlFor={`${formId}-name`} className="block text-[12px] font-medium text-[#3a4474] mb-1.5">Name on card</label>
            <input id={`${formId}-name`} value={cardForm.name} onChange={setField("name")} placeholder="Your name" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${formId}-exp`} className="block text-[12px] font-medium text-[#3a4474] mb-1.5">Expiry (MM/YY)</label>
              <input id={`${formId}-exp`} value={cardForm.expiry} onChange={setField("expiry")} placeholder="08/28" maxLength={5} className={inputCls} />
            </div>
            <div>
              <label htmlFor={`${formId}-cvc`} className="block text-[12px] font-medium text-[#3a4474] mb-1.5">CVC</label>
              <input id={`${formId}-cvc`} value={cardForm.cvc} onChange={setField("cvc")} inputMode="numeric" placeholder="123" maxLength={4} className={inputCls} />
            </div>
          </div>
        </BillingModal>
      )}

      {/* ── Remove card modal ── */}
      {modal === "removeCard" && removingCard && (
        <BillingModal
          title="Remove this card?"
          onClose={closeModal}
          footer={
            <>
              <ModalBtn onClick={closeModal}>Keep card</ModalBtn>
              <ModalBtn variant="danger" onClick={confirmRemoveCard}>Remove card</ModalBtn>
            </>
          }
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "#fdebef", color: "#e11d48", display: "grid", placeItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </span>
            <p style={{ fontSize: 13, color: "#3a4474", lineHeight: 1.55 }}>
              <strong style={{ color: "#0b1020" }}>{brandName(removingCard.brand)} ending in {removingCard.last4}</strong> will be removed.
              {removingCard.isDefault && cards.length > 1 && " Your other card will become the default."}
              {cards.length === 1 && " This is your only card — renewals will fail until you add another."}
            </p>
          </div>
        </BillingModal>
      )}
    </div>
  );
}

const inputCls = "w-full border border-[#d6dae9] rounded-lg px-3 py-[9px] text-[13.5px] text-[#0b1020] bg-white outline-none transition-all focus:border-[#6873ff] focus:ring-2 focus:ring-[#6873ff]/15 placeholder:text-[#a8aecb]";
