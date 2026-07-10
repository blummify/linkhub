import { cn } from "@/lib/cn";

export interface PlanToggleSwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function PlanToggleSwitch({ checked, label, onChange }: PlanToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 flex-none rounded-full border transition-colors",
        checked ? "border-indigo-500 bg-indigo-500" : "border-ink-200 bg-ink-200"
      )}
    >
      <span
        className={cn(
          "absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
