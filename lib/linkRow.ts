/**
 * Row shape for `Link` records from the DB.
 * Kept here (not from `@prisma/client`) so CI typecheck works even if
 * generated client typings differ between environments.
 */
import type { LinkStatusValue } from "@/constants/linkStatus";

export type LinkRow = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  clicks: number;
  status: LinkStatusValue;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
