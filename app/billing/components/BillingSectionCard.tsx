import type { ReactNode } from "react";

interface BillingSectionCardProps {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  /** Shown below a top-border divider at card bottom */
  footer?: ReactNode;
  className?: string;
}

export function BillingSectionCard({
  title,
  description,
  headerAction,
  children,
  footer,
  className = "",
}: BillingSectionCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#eef0f7] flex flex-col h-full ${className}`}
      style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)", padding: "22px 24px" }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0b1020" }}>{title}</p>
            {description && (
              <p style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 3, lineHeight: 1.45 }}>
                {description}
              </p>
            )}
          </div>
          {headerAction && <div style={{ flexShrink: 0 }}>{headerAction}</div>}
        </div>
      </div>

      <div style={{ flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #eef0f7",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
