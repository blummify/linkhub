"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import type { CurrencyCode, GeneralSettings } from "../../services/types";
import { Field, INPUT_CLASS } from "./Field";

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: "EUR", label: "EUR — Euro" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GHS", label: "GHS — Cedi" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface GeneralCardProps {
  value: GeneralSettings;
  onSave: (input: GeneralSettings) => Promise<void>;
}

export function GeneralCard({ value, onSave }: GeneralCardProps) {
  const [currency, setCurrency] = useState(value.defaultCurrency);
  const [email, setEmail] = useState(value.supportEmail);
  const [saving, setSaving] = useState(false);

  const trimmedEmail = email.trim();
  const emailValid = EMAIL_RE.test(trimmedEmail);
  const dirty = currency !== value.defaultCurrency || trimmedEmail !== value.supportEmail;

  async function save() {
    if (!dirty || !emailValid) return;
    setSaving(true);
    try {
      await onSave({ defaultCurrency: currency, supportEmail: trimmedEmail });
      toast.success("General settings saved", { description: "Change recorded in the audit log." });
    } catch {
      toast.error("Couldn't save settings. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="General">
      <Field label="Default currency" htmlFor="settings-currency" className="mb-3.5">
        <select
          id="settings-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className={INPUT_CLASS}
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Support email"
        htmlFor="settings-support-email"
        error={trimmedEmail && !emailValid ? "Enter a valid email address." : null}
        hint="Shown to users on error, billing, and account pages."
        className="mb-4"
      >
        <input
          id="settings-support-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
        />
      </Field>

      <Button variant="primary" onClick={save} disabled={!dirty || !emailValid || saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </Card>
  );
}
