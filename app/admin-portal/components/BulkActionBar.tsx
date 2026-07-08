"use client";

import { Button } from "./Button";
import { Icon } from "../icons";
import type { Plan } from "../services/types";

const PLAN_OPTIONS: { value: Plan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
];

export interface BulkActionBarProps {
  count: number;
  onChangePlan: (plan: Plan) => void;
  onExport: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/**
 * Appears above the users table while rows are selected. The destructive
 * actions only request intent here — the parent gates them behind a confirm
 * dialog before anything runs.
 */
export function BulkActionBar({
  count,
  onChangePlan,
  onExport,
  onSuspend,
  onDelete,
  onClear,
}: BulkActionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="mb-3.5 flex flex-wrap items-center gap-2 rounded-[14px] bg-ink-900 px-4 py-2.5 text-white"
    >
      <span aria-live="polite" className="mr-1 text-[13px] font-medium tabular-nums">
        {count} selected
      </span>
      <label htmlFor="bulk-plan" className="sr-only">
        Change plan
      </label>
      <select
        id="bulk-plan"
        value=""
        onChange={(event) => {
          if (event.target.value) onChangePlan(event.target.value as Plan);
        }}
        className="h-[32px] rounded-[10px] border border-white/20 bg-transparent px-2 text-[13px] text-white [&>option]:text-ink-900"
      >
        <option value="" disabled>
          Change plan…
        </option>
        {PLAN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        onClick={onExport}
        className="border-white/20 bg-transparent px-3 py-1.5 text-[13px] text-white hover:bg-white/10"
      >
        <Icon name="export" className="h-4 w-4" />
        Export
      </Button>
      <Button variant="amber" onClick={onSuspend} className="px-3 py-1.5 text-[13px]">
        Suspend
      </Button>
      <Button variant="danger" onClick={onDelete} className="px-3 py-1.5 text-[13px]">
        Delete
      </Button>
      <Button
        variant="ghost"
        onClick={onClear}
        className="ml-auto px-3 py-1.5 text-[13px] text-white/70 hover:text-white"
      >
        Clear
      </Button>
    </div>
  );
}
