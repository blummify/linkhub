import { toast } from "sonner";
import { BillingSectionCard } from "./BillingSectionCard";

type InvoiceStatus = "paid" | "pending" | "failed";

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: InvoiceStatus;
}

const INVOICES: Invoice[] = [
  { id: "inv-1", date: "Dec 14, 2025", description: "Pro plan — annual renewal",   amount: "$144.00", status: "paid" },
  { id: "inv-2", date: "Dec 14, 2024", description: "Pro plan — annual renewal",   amount: "$144.00", status: "paid" },
  { id: "inv-3", date: "Aug 02, 2024", description: "Overage — page views (10k)", amount: "$8.50",   status: "paid" },
  { id: "inv-4", date: "Dec 14, 2023", description: "Pro plan — annual renewal",   amount: "$120.00", status: "paid" },
];

const STATUS: Record<InvoiceStatus, { bg: string; dot: string; text: string; label: string }> = {
  paid:    { bg: "#e8f6ee", dot: "#16a34a", text: "#15803d", label: "Paid" },
  pending: { bg: "#fdf3e3", dot: "#d97706", text: "#b45309", label: "Pending" },
  failed:  { bg: "#fdebef", dot: "#e11d48", text: "#e11d48", label: "Failed" },
};

const TH: React.CSSProperties = {
  textAlign: "left",
  fontSize: 10.5, fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.08em",
  color: "#6b75a3",
  padding: "0 8px 12px",
  borderBottom: "1px solid #eef0f7",
};

const TD: React.CSSProperties = {
  padding: "13px 8px",
  fontSize: 13,
  borderBottom: "1px solid #eef0f7",
  verticalAlign: "middle",
};

export function InvoiceHistorySection() {
  return (
    <BillingSectionCard
      title="Invoice history"
      description="Download receipts for accounting or tax purposes."
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Date</th>
            {/* inv-desc-col hidden on mobile via globals.css */}
            <th style={TH} className="inv-desc-col">Description</th>
            <th style={{ ...TH, textAlign: "right" }}>Amount</th>
            <th style={TH}>Status</th>
            <th style={{ ...TH, textAlign: "right" }}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv, i) => {
            const s = STATUS[inv.status];
            const isLast = i === INVOICES.length - 1;
            const td: React.CSSProperties = { ...TD, borderBottom: isLast ? "none" : TD.borderBottom };
            return (
              /* hover:bg-[#f7f8fc] via Tailwind — no onMouseEnter/Leave DOM mutation */
              <tr key={inv.id} className="hover:bg-[#f7f8fc] transition-colors">
                <td style={{ ...td, color: "#1a2244", fontWeight: 500, whiteSpace: "nowrap" }}>{inv.date}</td>
                <td style={{ ...td, color: "#3a4474" }} className="inv-desc-col">{inv.description}</td>
                <td style={{ ...td, textAlign: "right", fontFamily: "'Geist Mono', monospace", fontSize: 12.5, color: "#1a2244" }}>
                  {inv.amount}
                </td>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.text }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                    {s.label}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  {/* hover via Tailwind — no onMouseEnter/Leave DOM mutation */}
                  <button
                    onClick={() => toast(`Downloading invoice from ${inv.date}…`)}
                    className="inline-flex items-center gap-[5px] bg-transparent hover:bg-[#f1f3ff] rounded-[6px] px-[6px] py-1 text-[#3b46e0] hover:text-[#2a37c0] transition-colors text-[12px] font-medium cursor-pointer border-0"
                    aria-label={`Download invoice from ${inv.date}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    PDF
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-3.5 text-center">
        <button
          onClick={() => toast("Loading older invoices…")}
          className="bg-white text-[#1a2244] border border-[#d6dae9] rounded-lg px-[14px] py-[6px] text-[12px] font-medium cursor-pointer hover:border-[#a8aecb] hover:bg-[#f7f8fc] transition-colors"
        >
          View all invoices
        </button>
      </div>
    </BillingSectionCard>
  );
}
