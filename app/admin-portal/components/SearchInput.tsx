import { cn } from "@/lib/cn";
import { Icon } from "../icons";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-[12px] border border-ink-100 bg-white px-3.5 py-2.5 text-[13.5px] text-ink-400",
        className
      )}
    >
      <Icon name="search" className="h-4 w-4 flex-none" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
    </div>
  );
}
