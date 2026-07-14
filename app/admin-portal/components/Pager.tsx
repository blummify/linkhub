import { cn } from "@/lib/cn";

export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

const BUTTON_BASE =
  "grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-ink-100 bg-white text-[12.5px] text-ink-600 disabled:cursor-not-allowed disabled:opacity-40";

export type PageItem = number | "ellipsis";

/**
 * Windowed page list: first, last, and current ±1, with ellipses for the gaps,
 * so a large dataset never renders hundreds of buttons. Short ranges (≤ 7)
 * render in full — an ellipsis would only replace a single page there.
 */
export function pageItems(page: number, lastPage: number): PageItem[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const start = Math.max(2, page - 1);
  const end = Math.min(lastPage - 1, page + 1);

  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let value = start; value <= end; value++) items.push(value);
  if (end < lastPage - 1) items.push("ellipsis");
  items.push(lastPage);
  return items;
}

export function Pager({ page, pageSize, total, onPage }: PagerProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

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
      {pageItems(page, lastPage).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="grid h-[30px] w-[30px] place-items-center text-[12.5px] text-ink-400"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPage(item)}
            className={cn(BUTTON_BASE, item === page && "border-ink-900 bg-ink-900 text-white")}
          >
            {item}
          </button>
        )
      )}
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
