import { toast } from "sonner";
import { BillingSectionCard } from "./BillingSectionCard";
import type { InvoiceDTO } from "@/app/actions/billing";

type InvoiceStatus = InvoiceDTO["status"];

interface InvoiceHistorySectionProps {
  invoices: InvoiceDTO[];
  isLoading: boolean;
}

const STATUS: Record<InvoiceStatus, { bg: string; dot: string; text: string; label: string }> = {
  success: { bg: "#e8f6ee", dot: "#16a34a", text: "#15803d", label: "Paid" },
  pending: { bg: "#fdf3e3", dot: "#d97706", text: "#b45309", label: "Pending" },
  failed:  { bg: "#fdebef", dot: "#e11d48", text: "#e11d48", label: "Failed" },
};

const TH: React.CSSProperties = { textAlign: "left", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b75a3", padding: "0 8px 12px", borderBottom: "1px solid #eef0f7" };
const TD: React.CSSProperties = { padding: "13px 8px", fontSize: 13, borderBottom: "1px solid #eef0f7", verticalAlign: "middle" };

export function InvoiceHistorySection({ invoices, isLoading }: InvoiceHistorySectionProps) {
  if (isLoading) {
    return (
      <BillingSectionCard title="Invoice history" description="Download receipts for accounting or tax purposes.">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-[#eef0f7] rounded-lg animate-pulse" />)}
        </div>
      </BillingSectionCard>
    );
  }

  if (invoices.length === 0) {
    return (
      <BillingSectionCard title="Invoice history" description="Download receipts for accounting or tax purposes.">
        <p className="text-[13px] text-[#6b75a3] text-center py-5">No invoices yet.</p>
      </BillingSectionCard>
    );
  }

  return (
    <BillingSectionCard title="Invoice history" description="Download receipts for accounting or tax purposes.">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Date</th>
            <th style={TH} className="inv-desc-col">Description</th>
            <th style={{ ...TH, textAlign: "right" }}>Amount</th>
            <th style={TH}>Status</th>
            <th style={{ ...TH, textAlign: "right" }}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => {
            const s = STATUS[inv.status];
            const isLast = i === invoices.length - 1;
            const td: React.CSSProperties = { ...TD, borderBottom: isLast ? "none" : TD.borderBottom };
            return (
              <tr key={inv.id} className="hover:bg-[#f7f8fc] transition-colors">
                <td style={{ ...td, color: "#1a2244", fontWeight: 500, whiteSpace: "nowrap" }}>{inv.date}</td>
                <td style={{ ...td, color: "#3a4474" }} className="inv-desc-col">Linkhub Pro</td>
                <td style={{ ...td, textAlign: "right", fontFamily: "'Geist Mono', monospace", fontSize: 12.5, color: "#1a2244" }}>{inv.amount}</td>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.text }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                    {s.label}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  {inv.pdfUrl ? (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-[5px] bg-transparent hover:bg-[#f1f3ff] rounded-[6px] px-[6px] py-1 text-[#3b46e0] hover:text-[#2a37c0] transition-colors text-[12px] font-medium border-0"
                      aria-label={`Download invoice from ${inv.date}`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      PDF
                    </a>
                  ) : (
                    <span className="text-[12px] text-[#a8aecb]">—</span>
                  )}
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
