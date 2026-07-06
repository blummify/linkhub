import { cn } from "@/lib/cn";
import type { SystemComponentStatus, SystemStatus } from "../services/types";

const STATUS_LABEL: Record<SystemStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

const STATUS_DOT: Record<SystemStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-amber-500",
  down: "bg-rose-500",
};

const STATUS_TEXT: Record<SystemStatus, string> = {
  operational: "text-green-500",
  degraded: "text-amber-500",
  down: "text-rose-500",
};

export function StatusList({ items }: { items: SystemComponentStatus[] }) {
  return (
    <div>
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2.5 border-b border-ink-100 py-2.5 text-[13px] last:border-b-0"
        >
          <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[item.status])} />
          <span className="text-ink-900">{item.name}</span>
          <span className={cn("ml-auto text-xs font-medium", STATUS_TEXT[item.status])}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
