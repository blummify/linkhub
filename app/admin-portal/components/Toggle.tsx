"use client";

import { cn } from "@/lib/cn";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Required — the switch has no visible text of its own. */
  "aria-label": string;
  disabled?: boolean;
  id?: string;
}

/**
 * Accessible on/off switch. A native <button role="switch"> is focusable and
 * keyboard-operable (Space/Enter) for free; callers own the label.
 */
export function Toggle({ checked, onChange, disabled, id, "aria-label": ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-[42px] flex-none rounded-full transition-colors motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-indigo-500" : "bg-ink-200"
      )}
    >
      <span
        className={cn(
          "absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform motion-reduce:transition-none",
          checked && "translate-x-[18px]"
        )}
      />
    </button>
  );
}
