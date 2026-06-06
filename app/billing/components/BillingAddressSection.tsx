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

const FIELDS: {
  id: keyof typeof INITIAL;
  label: string;
  placeholder?: string;
  hint?: string;
  full?: boolean;
}[] = [
  { id: "name",     label: "Name on invoice" },
  { id: "company",  label: "Company (optional)", placeholder: "—" },
  { id: "country",  label: "Country" },
  { id: "address",  label: "Address", full: true },
  { id: "city",     label: "City" },
  { id: "postcode", label: "Postal / ZIP" },
  { id: "taxId",    label: "Tax ID / VAT (optional)", placeholder: "e.g. GH-123456789" },
];

/* Tailwind classes for editable vs read-only inputs — no onFocus/onBlur DOM mutation */
const editingCls =
  "w-full border border-[#d6dae9] rounded-lg px-3 py-[9px] text-[13.5px] text-[#0b1020] bg-white outline-none transition-all focus:border-[#6873ff] focus:ring-2 focus:ring-[#6873ff]/15 placeholder:text-[#a8aecb]";

const readonlyCls =
  "w-full border border-transparent px-0 py-[9px] text-[13.5px] text-[#0b1020] bg-transparent outline-none cursor-default placeholder:text-[#a8aecb]";

export function BillingAddressSection() {
  const [form, setForm]       = useState(INITIAL);
  const [saved, setSaved]     = useState(INITIAL);
  const [editing, setEditing] = useState(false);

  const editBtn = !editing && (
    <button
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-[7px] bg-white text-[#1a2244] border border-[#d6dae9] rounded-lg px-[14px] py-[8px] text-[13px] font-medium cursor-pointer hover:border-[#a8aecb] hover:bg-[#f7f8fc] transition-colors"
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
        className="bg-white text-[#1a2244] border border-[#d6dae9] rounded-lg px-[14px] py-[8px] text-[13px] font-medium cursor-pointer hover:border-[#a8aecb] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={() => { setSaved(form); setEditing(false); }}
        className="bg-[#3b46e0] text-white border-none rounded-lg px-[14px] py-[8px] text-[13px] font-medium cursor-pointer hover:bg-[#2a37c0] transition-colors shadow-[0_4px_12px_-4px_rgba(59,70,224,0.4)]"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FIELDS.map(({ id, label, placeholder, full }) => (
          <div key={id} className={full ? "sm:col-span-3" : undefined}>
            <label
              htmlFor={`addr-${id}`}
              className="block text-[12px] font-medium text-[#3a4474] mb-1.5"
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
              className={editing ? editingCls : readonlyCls}
            />
          </div>
        ))}
      </div>
    </BillingSectionCard>
  );
}
