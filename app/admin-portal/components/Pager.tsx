import { cn } from "@/lib/cn";

export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

const BUTTON_BASE =
  "grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-ink-100 bg-white text-[12.5px] text-ink-600 disabled:cursor-not-allowed disabled:opacity-40";

export function Pager({ page, pageSize, total, onPage }: PagerProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const pages = Array.from({ length: lastPage }, (_, index) => index + 1);

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={BUTTON_BASE}
      >
        ‹
      </button>
      {pages.map((value) => {
        const isCurrent = value === page;
        return (
          <button
            key={value}
            type="button"
            aria-label={`Page ${value}`}
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onPage(value)}
            className={cn(BUTTON_BASE, isCurrent && "border-ink-900 bg-ink-900 text-white")}
          >
            {value}
          </button>
        );
      })}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= lastPage}
        onClick={() => onPage(page + 1)}
        className={BUTTON_BASE}
      >
        ›
      </button>
    </div>
  );
}
