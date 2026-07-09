import { cn } from "@/lib/cn";
import { Icon } from "../icons";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  "aria-label": string;
  className?: string;
}

/** A native, keyboard-operable select styled to match `SearchInput`/`Pager`. */
export function Select<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
}: SelectProps<T>) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-[12px] border border-ink-100 bg-white text-[13px] text-ink-700",
        className
      )}
    >
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-label={ariaLabel}
        className="appearance-none bg-transparent py-2.5 pl-3.5 pr-9 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-ink-400" />
    </div>
  );
}
