import type { ReactNode } from "react";

/** Shared control styling for the settings inputs/selects. */
export const INPUT_CLASS =
  "w-full rounded-[12px] border-[1.5px] border-ink-100 bg-paper px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white motion-reduce:transition-none";

export interface FieldProps {
  label: string;
  /** Must match the control's id so the label is programmatically associated. */
  htmlFor: string;
  hint?: ReactNode;
  /** When set, replaces the hint and is announced as the field's error. */
  error?: string | null;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-ink-500"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[12px] text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}
