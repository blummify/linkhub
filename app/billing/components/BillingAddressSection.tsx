"use client";

import { useState } from "react";
import { BillingSectionCard } from "./BillingSectionCard";

const INITIAL = {
  name: "Joel Osei Acquah",
  company: "",
  country: "Ghana",
  address: "12 Independence Ave",
  city: "Accra",
  postcode: "GA-184",
  taxId: "",
};

const FIELDS: { id: keyof typeof INITIAL; label: string; placeholder?: string; hint?: string; full?: boolean }[] = [
  { id: "name",     label: "Name on invoice" },
  { id: "company",  label: "Company (optional)", placeholder: "—" },
  { id: "country",  label: "Country" },
  { id: "address",  label: "Address", full: true },
  { id: "city",     label: "City" },
  { id: "postcode", label: "Postal / ZIP" },
  { id: "taxId",    label: "Tax ID / VAT (optional)", placeholder: "e.g. GH-123456789" },
];

export function BillingAddressSection() {
  const [form, setForm] = useState(INITIAL);
  const [saved, setSaved] = useState(INITIAL);
  const [editing, setEditing] = useState(false);

  const editBtn = !editing && (
    <button
      onClick={() => setEditing(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "white", color: "#1a2244",
        border: "1px solid #d6dae9", borderRadius: 8, padding: "8px 14px",
        fontSize: 13, fontWeight: 500, cursor: "pointer",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z" />
      </svg>
      Edit
    </button>
  );

  const footer = editing ? (
    <>
      <button
        onClick={() => { setForm(saved); setEditing(false); }}
        style={{
          background: "white", color: "#1a2244",
          border: "1px solid #d6dae9", borderRadius: 8, padding: "8px 14px",
          fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}
      >
        Cancel
      </button>
      <button
        onClick={() => { setSaved(form); setEditing(false); }}
        style={{
          background: "#3b46e0", color: "white",
          border: "none", borderRadius: 8, padding: "8px 14px",
          fontSize: 13, fontWeight: 500, cursor: "pointer",
          boxShadow: "0 4px 12px -4px rgba(59,70,224,0.4)",
        }}
      >
        Save changes
      </button>
    </>
  ) : undefined;

  return (
    <BillingSectionCard
      title="Billing address"
      description="Shown on your invoices. Some regions require this for tax purposes."
      headerAction={editBtn}
      footer={footer}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {FIELDS.map(({ id, label, placeholder, full }) => (
          <div key={id} style={full ? { gridColumn: "1 / -1" } : undefined}>
            <label
              htmlFor={`addr-${id}`}
              style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3a4474", marginBottom: 6 }}
            >
              {label}
            </label>
            <input
              id={`addr-${id}`}
              type="text"
              disabled={!editing}
              value={form[id]}
              placeholder={placeholder}
              onChange={(e) => setForm((prev) => ({ ...prev, [id]: e.target.value }))}
              style={{
                width: "100%",
                border: editing ? "1px solid #d6dae9" : "1px solid transparent",
                borderRadius: 8,
                padding: editing ? "9px 12px" : "9px 0",
                fontSize: 13.5,
                color: "#0b1020",
                background: editing ? "white" : "transparent",
                outline: "none",
                cursor: editing ? "text" : "default",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                if (editing) {
                  e.currentTarget.style.borderColor = "#6873ff";
                  e.currentTarget.style.boxShadow = "0 0 0 3px #f1f3ff";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = editing ? "#d6dae9" : "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        ))}
      </div>
    </BillingSectionCard>
  );
}
