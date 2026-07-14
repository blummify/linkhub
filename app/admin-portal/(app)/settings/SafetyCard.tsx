"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Toggle } from "../../components/Toggle";
import type { SafetySettings } from "../../services/types";
import { Field, INPUT_CLASS } from "./Field";
import { SettingRow } from "./SettingRow";

const MIN_REPORTS = 1;
const MAX_REPORTS = 100;

export interface SafetyCardProps {
  value: SafetySettings;
  onSave: (input: SafetySettings) => Promise<void>;
}

export function SafetyCard({ value, onSave }: SafetyCardProps) {
  const [autoFlag, setAutoFlag] = useState(value.autoFlagSuspiciousLinks);
  const [reports, setReports] = useState(String(value.autoSuspendAfterReports));
  const [saving, setSaving] = useState(false);

  const reportsNum = Number(reports);
  const reportsValid =
    reports.trim() !== "" &&
    Number.isInteger(reportsNum) &&
    reportsNum >= MIN_REPORTS &&
    reportsNum <= MAX_REPORTS;
  const dirty =
    autoFlag !== value.autoFlagSuspiciousLinks || reportsNum !== value.autoSuspendAfterReports;

  async function save() {
    if (!dirty || !reportsValid) return;
    setSaving(true);
    try {
      await onSave({ autoFlagSuspiciousLinks: autoFlag, autoSuspendAfterReports: reportsNum });
      toast.success("Abuse & safety settings saved", {
        description: "Change recorded in the audit log.",
      });
    } catch {
      toast.error("Couldn't save settings. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Abuse & safety">
      <SettingRow
        title="Auto-flag suspicious links"
        description="Scan new links against safe-browsing lists"
        control={
          <Toggle checked={autoFlag} onChange={setAutoFlag} aria-label="Auto-flag suspicious links" />
        }
        className="pt-0"
      />

      <Field
        label="Auto-suspend after N reports"
        htmlFor="settings-auto-suspend"
        error={
          reports.trim() !== "" && !reportsValid
            ? `Enter a whole number between ${MIN_REPORTS} and ${MAX_REPORTS}.`
            : null
        }
        hint="A page is auto-suspended once it reaches this many unique reports."
        className="mt-3.5"
      >
        <input
          id="settings-auto-suspend"
          type="number"
          inputMode="numeric"
          min={MIN_REPORTS}
          max={MAX_REPORTS}
          value={reports}
          onChange={(e) => setReports(e.target.value)}
          className={INPUT_CLASS}
        />
      </Field>

      <Button
        variant="primary"
        onClick={save}
        disabled={!dirty || !reportsValid || saving}
        className="mt-4"
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </Card>
  );
}
