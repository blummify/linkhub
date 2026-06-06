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

/* Tailwind hover/focus via CSS — no onMouseEnter/Leave DOM mutation */
const iconBtnCls =
  "w-8 h-8 rounded-lg border border-[#d6dae9] bg-transparent text-[#3a4474] grid place-items-center cursor-pointer transition-colors hover:bg-white hover:border-[#a8aecb] hover:text-[#0b1020]";

function IconBtn({ title, onClick, children }: { title: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className={iconBtnCls}>
      {children}
    </button>
  );
}

export function PaymentMethodsSection({ cards, onAddCard, onMakeDefault, onEditCard, onRemoveCard }: PaymentMethodsSectionProps) {
  const addBtn = (
    <button
      onClick={onAddCard}
      className="inline-flex items-center gap-1.5 bg-white text-[#1a2244] border border-[#d6dae9] rounded-lg px-[14px] py-[8px] text-[13px] font-medium cursor-pointer hover:border-[#a8aecb] hover:bg-[#f7f8fc] transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
      </svg>
      Add card
    </button>
  );

  return (
    <BillingSectionCard
      title="Payment methods"
      description="Cards used for renewal and any usage overages."
      headerAction={addBtn}
    >
      {cards.length === 0 ? (
        <p className="text-[13px] text-[#6b75a3] text-center py-5">
          No payment methods yet. Add a card to keep your subscription active.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cards.map((card) => {
            const b = BRAND[card.brand];
            return (
              <div
                key={card.id}
                className="flex items-center gap-3.5 px-[15px] py-[13px] border border-[#eef0f7] rounded-xl bg-[#f7f8fc]"
              >
                {/* Brand chip */}
                <span
                  className="shrink-0 grid place-items-center text-white rounded-[6px] shadow-sm"
                  style={{
                    width: 44, height: 30,
                    background: b.bg,
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                  }}
                >
                  {b.label}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[13.5px] font-medium text-[#0b1020]">
                    {b.name} ending in {card.last4}
                    {card.isDefault && (
                      <span className="text-[10px] font-semibold text-[#2a37c0] bg-[#e6e9ff] px-[7px] py-0.5 rounded-full tracking-[0.04em]">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-[#6b75a3] mt-0.5">Expires {card.expiry}</div>
                </div>

                <div className="flex gap-1.5">
                  {!card.isDefault && (
                    <IconBtn title={`Make ${b.name} ••• ${card.last4} default`} onClick={() => onMakeDefault(card.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </IconBtn>
                  )}
                  <IconBtn title="Edit card" onClick={() => onEditCard(card)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z" />
                    </svg>
                  </IconBtn>
                  <IconBtn title="Remove card" onClick={() => onRemoveCard(card)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
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
