import type { PageStatus } from "../services/types";
import { Badge, type BadgeTone } from "./Badge";

const STATUS_TONE: Record<PageStatus, BadgeTone> = {
  live: "green",
  flagged: "amber",
  suspended: "rose",
};

const STATUS_LABEL: Record<PageStatus, string> = {
  live: "Live",
  flagged: "Flagged",
  suspended: "Suspended",
};

export function PageStatusBadge({ status }: { status: PageStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
