import { cn } from "@/lib/cn";

export interface FilterTab<T extends string> {
  value: T;
  label: string;
}

export interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  active: T;
  onChange: (value: T) => void;
  "aria-label": string;
}

export function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
  "aria-label": ariaLabel,
}: FilterTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-full border border-ink-100 bg-white p-[3px]"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-full px-3.5 py-[7px] text-[13px] transition-colors motion-reduce:transition-none",
              isActive ? "bg-ink-900 font-medium text-white" : "text-ink-500 hover:text-ink-700"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
