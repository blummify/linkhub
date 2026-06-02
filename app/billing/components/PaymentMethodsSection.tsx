import { BillingSectionCard } from "./BillingSectionCard";

export interface PaymentCard {
  id: number;
  brand: "visa" | "mc" | "amex";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodsSectionProps {
  cards: PaymentCard[];
  onAddCard: () => void;
  onMakeDefault: (id: number) => void;
  onEditCard: (card: PaymentCard) => void;
  onRemoveCard: (card: PaymentCard) => void;
}

const BRAND: Record<PaymentCard["brand"], { label: string; name: string; bg: string }> = {
  visa: { label: "VISA", name: "Visa",       bg: "linear-gradient(135deg, #1a1f4d, #3b46e0)" },
  mc:   { label: "MC",   name: "Mastercard", bg: "linear-gradient(135deg, #eb001b, #f79e1b)" },
  amex: { label: "AMEX", name: "Amex",       bg: "linear-gradient(135deg, #006fcf, #00529b)" },
};

function IconBtn({ title, onClick, children }: { title: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid #d6dae9", color: "#3a4474", display: "grid", placeItems: "center", cursor: "pointer" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#a8aecb"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9"; }}
    >
      {children}
    </button>
  );
}

export function PaymentMethodsSection({ cards, onAddCard, onMakeDefault, onEditCard, onRemoveCard }: PaymentMethodsSectionProps) {
  const addBtn = (
    <button
      onClick={onAddCard}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "white", color: "#1a2244", border: "1px solid #d6dae9", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
      </svg>
      Add card
    </button>
  );

  return (
    <BillingSectionCard title="Payment methods" description="Cards used for renewal and any usage overages." headerAction={addBtn}>
      {cards.length === 0 ? (
        <p style={{ fontSize: 13, color: "#6b75a3", textAlign: "center", padding: "22px 0" }}>
          No payment methods yet. Add a card to keep your subscription active.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.map((card) => {
            const b = BRAND[card.brand];
            return (
              <div key={card.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", border: "1px solid #eef0f7", borderRadius: 12, background: "#f7f8fc" }}>
                <span style={{ width: 44, height: 30, borderRadius: 6, flexShrink: 0, background: b.bg, color: "white", display: "grid", placeItems: "center", fontFamily: "'Geist Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                  {b.label}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0b1020", display: "flex", alignItems: "center", gap: 8 }}>
                    {b.name} ending in {card.last4}
                    {card.isDefault && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#2a37c0", background: "#e6e9ff", padding: "2px 7px", borderRadius: 99, letterSpacing: "0.04em" }}>DEFAULT</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 1 }}>Expires {card.expiry}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!card.isDefault && (
                    <IconBtn title={`Make ${b.name} ••• ${card.last4} default`} onClick={() => onMakeDefault(card.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </IconBtn>
                  )}
                  <IconBtn title="Edit card" onClick={() => onEditCard(card)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z" /></svg>
                  </IconBtn>
                  <IconBtn title="Remove card" onClick={() => onRemoveCard(card)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </IconBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BillingSectionCard>
  );
}
