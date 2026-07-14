"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";
import { PlanToggleSwitch } from "./PlanToggleSwitch";
import type { PlanAdminRow, PlanEditorDraft, PlanInterval } from "../services/types";
import { toggleLabel } from "../plans/planUtils";

export interface PlanEditorDialogProps {
  plan: PlanAdminRow | null;
  draft: PlanEditorDraft | null;
  onChange: (draft: PlanEditorDraft) => void;
  onClose: () => void;
  onSave: () => void;
}

export function PlanEditorDialog({ plan, draft, onChange, onClose, onSave }: PlanEditorDialogProps) {
  useEffect(() => {
    if (!plan) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [plan, onClose]);

  if (!plan || !draft) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-900/55 p-4">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div className="relative z-[91] w-full max-w-[560px] rounded-[16px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div>
            <div className="text-[13px] text-ink-400">Edit plan</div>
            <h3 className="mt-1 font-[family-name:var(--font-instrument-serif)] text-[28px] italic leading-none text-ink-900">
              {plan.name}
            </h3>
            <p className="mt-2 text-sm text-ink-400">
              {plan.plan === "pro"
                ? "Changes apply to all Pro subscribers."
                : plan.plan === "business"
                  ? "Changes apply to all Business subscribers."
                  : "Changes apply to all Free subscribers."}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Price">
              <input
                value={draft.price}
                onChange={(event) => onChange({ ...draft, price: event.target.value })}
                className="w-full rounded-[12px] border border-ink-100 bg-paper px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </Field>
            <Field label="Interval">
              <select
                value={draft.interval}
                onChange={(event) => onChange({ ...draft, interval: event.target.value as PlanInterval })}
                className="w-full rounded-[12px] border border-ink-100 bg-paper px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-400 focus:bg-white"
              >
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </Field>
            <Field label="Link limit">
              <input
                value={draft.linkLimit}
                onChange={(event) => onChange({ ...draft, linkLimit: event.target.value })}
                className="w-full rounded-[12px] border border-ink-100 bg-paper px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </Field>
            <Field label="Monthly views">
              <input
                value={draft.monthlyViews}
                onChange={(event) => onChange({ ...draft, monthlyViews: event.target.value })}
                className="w-full rounded-[12px] border border-ink-100 bg-paper px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </Field>
            <Field label="Custom domains">
              <input
                value={draft.customDomains}
                onChange={(event) => onChange({ ...draft, customDomains: event.target.value })}
                className="w-full rounded-[12px] border border-ink-100 bg-paper px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </Field>
            <Field label="Storage (GB)">
              <input
                value={draft.storage}
                onChange={(event) => onChange({ ...draft, storage: event.target.value })}
                className="w-full rounded-[12px] border border-ink-100 bg-paper px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </Field>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Feature toggles
            </div>
            <div className="space-y-0.5 rounded-[14px] border border-ink-100">
              {Object.entries(draft.featureToggles).map(([toggle, checked]) => (
                <div key={toggle} className="flex items-center justify-between gap-4 border-b border-ink-100 px-4 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-ink-900">{toggleLabel(toggle)}</div>
                  </div>
                  <PlanToggleSwitch
                    checked={checked}
                    onChange={(next) =>
                      onChange({
                        ...draft,
                        featureToggles: {
                          ...draft.featureToggles,
                          [toggle]: next,
                        },
                      })
                    }
                    label={toggle}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 px-6 py-4">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
        {label}
      </span>
      {children}
    </label>
  );
}
