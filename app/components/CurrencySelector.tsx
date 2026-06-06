"use client";

import { CURRENCIES, type CurrencyCode } from "@/lib/currencies";

interface Props {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      className={className}
      aria-label="Select currency"
      style={{
        appearance: "none",
        background: "transparent",
        border: "1px solid currentColor",
        borderRadius: 8,
        padding: "4px 28px 4px 10px",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
